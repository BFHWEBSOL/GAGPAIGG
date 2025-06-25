import ListCalculator from '../Funcs/Calc/Calculate.js';

export default function handler(req, res) {
  const tool = req.query;
  const requiredParams = ['Name', 'Weight'];
  for (const param of requiredParams) {
    if (!tool || !tool[param]) {
      return res.status(400).json({ error: `Missing required parameter: ${param}` });
    }
  }
  try {
    tool.Weight = { value: parseFloat(tool.Weight) };
    tool.Variant = { value: tool.Variant || 'Normal' };
    if (tool.Mutation) {
      tool.attributes = tool.Mutation.split(',').map(m => m.trim());
    } else {
      tool.attributes = [];
    }
    const result = ListCalculator.calculateFruit(tool);
    return res.status(200).json({ value: result });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
} 