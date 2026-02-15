# BankCLI Pro - Final Exam Instructions

---

> **Note for Instructor**
>
> All bug fixes have been implemented in `src/feature/index.js`.
>
> To verify all tests pass, please run:
>
> ```bash
> npm run test:feature
> ```

---

**Overview**
You will receive a CLI banking app. Your job is to test the app, document findings and bugs in a structured test plan, and write unit test cases that reproduce those findings. Fixing the code is optional.

**Required Workflow**

1. Test first (black box).
2. Document findings and bugs in `TEST-PLAN.md`.
3. Write unit test cases for your findings.
4. Optional: fix the code and update/add tests for fixed behavior.

**Phase 1: Black Box Testing**

- You receive only the executable app.
- Test each menu feature and record expected vs actual behavior.
- Document findings and bugs directly in `TEST-PLAN.md`.

**Phase 2: White Box Testing**

- You receive the full source code.
- Expand your test plan with deeper edge cases and risk assessment.
- Map key findings to code locations.

**Phase 3: Unit Test Development**

- Build a comprehensive Jest unit test suite.
- Every finding in `TEST-PLAN.md` must have a corresponding unit test case.
- Aim for **85%+ coverage** across statements, branches, functions, and lines.

**Phase 4: Optional Fixes and Refactor**

- Fix identified issues.
- Ensure your tests pass after fixes.
- Refactor for clarity without breaking functionality.

**Deliverables**

- `TEST-PLAN.md` (required)
- `test/` directory with Jest unit tests (required)
- `Reflection.md` reflection (required; max 3 short paragraphs)
- `src/` fixes and updated tests (optional)

**TEST-PLAN.md Requirements**
Your test plan must be valid Markdown and include a table with columns such as:

| Test ID | Feature        | Environment       | Steps         | Expected Result | Actual Result | Status    | Notes/Defect |
| ------- | -------------- | ----------------- | ------------- | --------------- | ------------- | --------- | ------------ |
| TP-001  | Create Account | Node.js + OS info | 1. ... 2. ... | ...             | ...           | Pass/Fail | ...          |

Include enough detail so another tester could reproduce the issue from your Steps and Environment fields.

**Reflection Requirement (Reflection.md)**
Write a short reflection (no more than 3 paragraphs) that covers:

- Challenges you faced
- Difficulties in testing or debugging
- What you learned

**Marking Criteria**

- Quality and completeness of findings
- Test plan clarity and reproducibility
- Unit test quality and coverage (target 85%+)
- Code quality and regression avoidance (if you fix bugs)
- Documentation clarity and professionalism
- Bonus credit for optional fixes and/or a small feature improvement
