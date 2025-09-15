# Council Management Module (Module 5)

## Overview
The Council Management module provides comprehensive functionality for managing class councils, including automatic student extraction, special case handling, voting systems, and statistical reporting.

## Features

### General Features
- **Automatic Top 3 Extraction**: Automatically extracts the top three students from each class based on their averages
- **Special Cases Management**: Handles redemption cases based on overall average and subject/module performance
- **Case Processing**: Generates lists of processed and unprocessed cases for jury president review
- **Rules Reminder**: Displays formulas and rules applied during council sessions
- **Statistics Dashboard**: Provides comprehensive statistics including:
  - Success rate
  - Percentage of students with average below 10 and above 15
  - Overall class average
  - Reported special cases count

### Jury President Features
- **Session Management**: Start and close council sessions for specific classes
- **Token Generation**: Generate secure access tokens for teachers
- **Statistics Overview**: View comprehensive statistics across all classes
- **Special Cases Review**: Review and process special redemption cases
- **Real-time Monitoring**: Track council progress in real-time

### Teacher Features
- **Token-based Access**: Secure access to council sessions using room-displayed tokens
- **Real-time Status**: View council status ("In Progress" or "Closed")
- **Voting System**: Vote for students in subjects/modules they teach
- **Absence Justification**: Submit justified absences with predefined reasons:
  - Participation in another council
  - Final project jury duty
  - Exam supervision
  - Project validation
  - Illness
- **Voting Restrictions**: One vote per student per module enforcement

## Components

### CouncilManagementComponent
Main component that handles the user interface and user interactions.

**Key Properties:**
- `userRole`: Determines user permissions ('jury_president' | 'teacher')
- `councilSessions`: Array of active council sessions
- `councils`: Array of council data with students and special cases
- `statistics`: Statistical data for dashboard
- `votes`: Voting records

**Key Methods:**
- `startCouncilForClass()`: Start a council session for a specific class
- `closeCouncilForClass()`: Close an active council session
- `validateToken()`: Validate teacher access token
- `voteForStudent()`: Submit a vote for a student
- `justifyAbsence()`: Submit absence justification

### CouncilManagementService
Service that handles HTTP communications and data management.

**Key Features:**
- RESTful API integration
- Real-time updates using BehaviorSubjects
- Local storage for offline functionality
- Error handling and logging
- Export functionality for reports

## Data Models

### CouncilSession
```typescript
interface CouncilSession {
  id: string;
  className: string;
  status: 'pending' | 'active' | 'closed';
  startTime?: string;
  endTime?: string;
  room?: string;
  token?: string;
}
```

### Student
```typescript
interface Student {
  id: string;
  name: string;
  average: number;
  subject?: string;
}
```

### SpecialCase
```typescript
interface SpecialCase {
  id: string;
  studentName: string;
  type: 'redemption_general' | 'redemption_subject';
  status: 'processed' | 'unprocessed';
  details?: string;
}
```

### Statistics
```typescript
interface Statistics {
  successRate: number;
  below10Percent: number;
  above15Percent: number;
  classAverage: number;
  specialCases: number;
}
```

## Usage

### For Jury Presidents
1. Navigate to `/council-management`
2. View overall statistics and council status
3. Click "Démarrer Session" to start a council for a specific class
4. Monitor real-time progress and voting
5. Review and process special cases
6. Close sessions when complete

### For Teachers
1. Navigate to `/council-management`
2. Click "Accéder au Conseil" and enter the room token
3. View students eligible for voting in your subjects
4. Submit votes (one per student per module)
5. Justify absence if unable to attend

## Security Features
- Token-based authentication for council access
- Role-based permissions (Jury President vs Teacher)
- One-time tokens with expiration
- Voting restrictions enforcement
- Secure session management

## Styling
The module follows the same design patterns as the existing "planification conseil" component:
- Consistent color scheme and typography
- Responsive grid layouts
- Interactive cards and modals
- Gradient backgrounds and hover effects
- Mobile-friendly responsive design

## API Endpoints
The service expects the following backend endpoints:
- `GET /council-management/sessions` - Get council sessions
- `POST /council-management/sessions/start` - Start council session
- `POST /council-management/sessions/validate-token` - Validate access token
- `GET /council-management/councils` - Get council data
- `GET /council-management/students/top/{className}` - Get top students
- `GET /council-management/special-cases` - Get special cases
- `POST /council-management/votes` - Submit vote
- `GET /council-management/statistics` - Get statistics
- `POST /council-management/absences` - Submit absence justification

## Testing
The module includes comprehensive unit tests for both component and service:
- Component functionality testing
- Service HTTP request testing
- Mock data and HTTP interceptors
- Error handling validation

## Installation
1. The component is already registered in `app.module.ts`
2. Routing is configured in `app-routing.module.ts`
3. Navigate to `/council-management` to access the module

## Dependencies
- Angular Forms (FormsModule) for form handling
- HttpClientModule for API communication
- Angular Router for navigation
- RxJS for reactive programming

## Future Enhancements
- WebSocket integration for real-time updates
- PDF report generation
- Email notifications
- Advanced filtering and search
- Audit trail logging
- Mobile app integration
