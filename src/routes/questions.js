const express = require("express");
const router = express.Router();
const Question = require("../models/Question");

// GET all questions with filters
router.get("/", async (req, res) => {
  try {
    const { company, difficulty, search } = req.query;
    let query = {};
    
    if (company) query.company = company;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } }
      ];
    }
    
    const questions = await Question.find(query).sort({ frequency: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all companies
router.get("/companies", async (req, res) => {
  try {
    const companies = await Question.distinct("company");
    res.json(companies.sort());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET questions by company
router.get("/company/:companyName", async (req, res) => {
  try {
    const questions = await Question.find({ 
      company: req.params.companyName 
    }).sort({ frequency: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new question
router.post("/", async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update question
router.put("/:id", async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
