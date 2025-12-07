# TaskMasterPro Workspace Instructions

## Project Overview
- **Backend**: .NET 8 Web API with PostgreSQL, AWS services (S3, SQS, SNS), JWT authentication
- **Frontend**: Angular with Tailwind CSS (taskmasterpro_FE)
- **Infrastructure**: Docker Compose with PostgreSQL, LocalStack, pgAdmin

## Progress Tracking

- [x] Verify copilot-instructions.md file created
- [x] Clarify project requirements - Angular with Tailwind for TaskMasterPro backend
- [ ] Scaffold the Angular project
- [ ] Customize the project with required features
- [ ] Install required extensions
- [ ] Compile the project
- [ ] Create and run development task
- [ ] Ensure documentation is complete

## Project Structure
```
TaskMasterPro/
├── src/                    # .NET Backend
│   ├── TaskMasterPro.API/
│   ├── TaskMasterPro.Domain/
│   └── TaskMasterPro.Infrastructure/
├── taskmasterpro_FE/      # Angular Frontend (to be created)
├── docker-compose.yml
└── .github/
```

## Development Guidelines
- Backend runs on http://localhost:5000
- Frontend will run on http://localhost:4200
- Use JWT authentication for protected endpoints
- Follow Angular standalone component pattern
- Use Tailwind CSS for styling
- Implement reactive forms for data entry
