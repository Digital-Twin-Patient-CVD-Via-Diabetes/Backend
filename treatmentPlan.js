import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const { llmApiKey } = process.env;


export default class TreatmentPlanner {
  constructor() {
    this.llmApiKey =llmApiKey;
    this.history   = {};
  }

  _cleanData(row) {
    const binaryCols = new Set([
      'hypertension', 'diabetes', 'is_pregnant',
      'is_smoking', 'heart_disease', 'is_alcohol_user'
    ]);

    return Object.fromEntries(
      Object.entries(row)
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, binaryCols.has(k) ? parseInt(v, 10) : v])
    );
  }

  _formatClinician(plan, specialty) {
    let out = `${specialty.toUpperCase()} SPECIALIST PLAN:\n`;
    const sections = plan.split(/\n\n+/).map(s => s.trim()).filter(Boolean);
    for (const sec of sections) {
      out += sec.match(/^[A-D]\.|^[1-4]\./) ? `${sec}\n` : `${sec}\n\n`;
    }
    return out.trim();
  }

  _formatPatient(plan) {
    if (plan.startsWith('[LLM ERROR')) return plan;
    const lines = plan.split('\n');
    let result = '';

    const idx = lines.findIndex(l => l.includes('SUMMARY FOR PATIENT'));
    if (idx >= 0) {
      result += lines[idx] + '\n';
      for (let i = idx + 1; i < lines.length; i++) {
        if (!lines[i].trim() || /^[1-4]\./.test(lines[i])) break;
        result += lines[i].trim() + '\n';
      }
      result += '\n';
    }

    const numbered = [];
    let buf = [];
    for (const l of lines) {
      const t = l.trim();
      if (/^[1-4]\./.test(t)) {
        if (buf.length) numbered.push(buf.join('\n'));
        buf = [t];
      } else if (buf.length && t) {
        buf.push(t);
      } else if (buf.length) {
        numbered.push(buf.join('\n'));
        buf = [];
      }
    }
    if (buf.length) numbered.push(buf.join('\n'));

    if (numbered.length) {
      result += 'DETAILED PLAN:\n\n';
      numbered.forEach(sec => { result += `${sec}\n\n`; });
    }

    return result.trim() || 'YOUR CARE PLAN:\n' + lines.slice(0, 8).filter(l => l.trim()).join('\n');
  }

  async _callLLM(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.llmApiKey}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };
    try {
      const { data } = await axios.post(url, payload, { timeout: 90000 });
      return data.candidates[0].content.parts[0].text;
    } catch (err) {
      console.error('LLM error:', err.message);
      return `[LLM ERROR: ${err.message}]`;
    }
  }

  _calculateCaloricNeeds(e) {
    const w = e.weight_kg || 70;
    const h = e.height_cm || 170;
    const a = e.age || 45;
    const act = (e.activity_level || 'moderate').toLowerCase();
    const g = (e.gender || 'male').toLowerCase();

    const bmi = w / ((h / 100) ** 2);
    const bmr = 10 * w + 6.25 * h - 5 * a + (g === 'male' ? 5 : -161);
    const mult = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
    const maint = bmr * (mult[act] || 1.55);

    let adj = 0, tgtW = w, goal = 'Maintain current healthy weight';
    if (bmi < 18.5) {
      tgtW = 18.5 * (h / 100) ** 2;
      adj = 300;
      goal = `Gain ${(tgtW - w).toFixed(1)} kg to BMI 18.5`;
    } else if (bmi > 25) {
      tgtW = 25 * (h / 100) ** 2;
      adj = -500;
      goal = `Lose ${(w - tgtW).toFixed(1)} kg to BMI 25`;
    }

    return {
      dailyCalories: Math.round(maint + adj),
      targetWeight: Number(tgtW.toFixed(1)),
      weightGoal: goal
    };
  }

  /**
   * Accepts a Mongoose document or plain JS object with patient data.
   * @param {string} id – patient _id or custom ID
   * @param {Object} row – patient document
   */
  async planForPatient(id, row) {
    const evidence = this._cleanData(row);
    const nutrition = this._calculateCaloricNeeds(evidence);

    const prompts = {
      diabetes:   `Generate a diabetes specialist plan. Patient: ${JSON.stringify(evidence)}`,
      cardiology: `Generate a cardiology specialist plan. Patient: ${JSON.stringify(evidence)}`,
      patient:    `Generate a patient-friendly plan. Data: ${JSON.stringify(evidence)}`
    };

    const [d, c, p] = await Promise.all([
      this._callLLM(prompts.diabetes),
      this._callLLM(prompts.cardiology),
      this._callLLM(prompts.patient),
    ]);

    return {
      patientId: id,
      diabetesSpecialistVersion:   this._formatClinician(d, 'Diabetes'),
      cardiologySpecialistVersion: this._formatClinician(c, 'Cardiology'),
      patientVersion:              this._formatPatient(p),
      nutritionTargets:            nutrition,
      raw: { diabetes: d, cardiology: c, patient: p }
    };
  }
}