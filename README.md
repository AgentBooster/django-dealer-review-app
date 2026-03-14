# DriveSphere Dealer Review App

Full-stack Django, React, and Express dealership review application built from the IBM full-stack capstone template and completed for final project submission.

## Project Name

`DriveSphere Dealer Review App`

## Stack

- Django for authentication, proxy endpoints, admin, and static hosting
- React for dealership listing, login, registration, dealer detail, and review submission
- Express for dealership and review data endpoints
- SQLite for `CarMake` and `CarModel`
- JSON-backed local dataset for dealers and reviews

## Main Features

- Updated landing, About Us, and Contact Us pages
- User registration, login, and logout
- Dealer list with state filtering
- Dealer detail page with sentiment-tagged reviews
- Review submission flow
- Django admin with car makes and car models
- Local artifact generation for cURL outputs and screenshots

## Local Run

1. Create the virtual environment:
   `python3 -m venv .venv`
2. Install Python dependencies:
   `.venv/bin/pip install -r server/requirements.txt Flask nltk`
3. Install frontend dependencies:
   `cd server/frontend && npm install`
4. Install backend dependencies:
   `cd ../database && npm install`
5. Apply migrations:
   `cd .. && ../.venv/bin/python manage.py migrate`
6. Populate car data and users:
   `../.venv/bin/python manage.py shell -c "from djangoapp.populate import initiate; initiate()"`
7. Start the Express API:
   `cd database && node app.js`
8. Start Django:
   `cd .. && ../.venv/bin/python manage.py runserver 127.0.0.1:8000`
9. Build the React app when frontend changes:
   `cd frontend && npm run build`

## Test Commands

- Django checks: `cd server && ../.venv/bin/python manage.py check`
- Django tests: `cd server && ../.venv/bin/python manage.py test`
- React tests: `cd server/frontend && CI=true npm test -- --watchAll=false --passWithNoTests`
- React build: `cd server/frontend && npm run build`

## Demo Credentials

- Admin user: `root` / `rootroot`
- Reviewer user: `reviewer` / `reviewerpass`

## Submission Artifacts

- Command outputs: `submission_artifacts/command_outputs`
- Screenshots: `submission_artifacts/screenshots`
- Submission checklist: `submission_artifacts/final_submission.md`
