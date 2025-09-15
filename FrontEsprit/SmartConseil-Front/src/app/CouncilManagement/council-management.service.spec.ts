import { TestBed } from '@angular/core/testing';
import { CouncilManagementService } from './council-management.service';
import { Council, CouncilSession, Student, SpecialCase, Statistics } from './council-management.component';

import { getTestConfig } from '../testing/test-helpers';
describe('CouncilManagementService', () => {
  let service: CouncilManagementService;
  let httpMock: HttpTestingController;
  const baseURL = 'http://localhost:8090/council-management';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CouncilManagementService]
    });
    service = TestBed.inject(CouncilManagementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get council sessions', () => {
    const mockSessions: CouncilSession[] = [
      {
        id: '1',
        className: '3INFO1',
        status: 'active',
        startTime: '09:00',
        room: 'A101',
        token: 'ABC123XY'
      }
    ];

    service.getCouncilSessions().subscribe(sessions => {
      expect(sessions).toEqual(mockSessions);
    });

    const req = httpMock.expectOne(`${baseURL}/sessions`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSessions);
  });

  it('should start council session', () => {
    const className = '3INFO1';
    const mockSession: CouncilSession = {
      id: '1',
      className,
      status: 'active',
      startTime: '09:00',
      room: 'A101'
    };

    service.startCouncilSession(className).subscribe(session => {
      expect(session).toEqual(mockSession);
    });

    const req = httpMock.expectOne(`${baseURL}/sessions/start`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ className });
    req.flush(mockSession);
  });

  it('should validate token', () => {
    const token = 'ABC123XY';
    const mockResponse = { valid: true, sessionId: '1', className: '3INFO1' };

    service.validateToken(token).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseURL}/sessions/validate-token`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ token });
    req.flush(mockResponse);
  });

  it('should get councils', () => {
    const mockCouncils: Council[] = [
      {
        id: '1',
        className: '3INFO1',
        status: 'active',
        topStudents: [],
        specialCases: []
      }
    ];

    service.getCouncils().subscribe(councils => {
      expect(councils).toEqual(mockCouncils);
    });

    const req = httpMock.expectOne(`${baseURL}/councils`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCouncils);
  });

  it('should get top students', () => {
    const className = '3INFO1';
    const mockStudents: Student[] = [
      { id: 's1', name: 'Ahmed Ben Ali', average: 18.5 },
      { id: 's2', name: 'Fatma Trabelsi', average: 17.8 }
    ];

    service.getTopStudents(className, 2).subscribe(students => {
      expect(students).toEqual(mockStudents);
    });

    const req = httpMock.expectOne(`${baseURL}/students/top/${className}?limit=2`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStudents);
  });

  it('should get special cases', () => {
    const mockCases: SpecialCase[] = [
      {
        id: 'sc1',
        studentName: 'Sami Bouaziz',
        type: 'redemption_general',
        status: 'unprocessed'
      }
    ];

    service.getSpecialCases().subscribe(cases => {
      expect(cases).toEqual(mockCases);
    });

    const req = httpMock.expectOne(`${baseURL}/special-cases`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCases);
  });

  it('should get statistics', () => {
    const mockStats: Statistics = {
      successRate: 78.5,
      below10Percent: 12.3,
      above15Percent: 45.7,
      classAverage: 13.2,
      specialCases: 3
    };

    service.getStatistics().subscribe(stats => {
      expect(stats).toEqual(mockStats);
    });

    const req = httpMock.expectOne(`${baseURL}/statistics`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);
  });

  it('should submit vote', () => {
    const vote = {
      studentId: 's1',
      teacherId: 't1',
      vote: 'approve' as const
    };

    const mockVoteResponse = {
      ...vote,
      timestamp: new Date()
    };

    service.submitVote(vote).subscribe(response => {
      expect(response.studentId).toBe(vote.studentId);
      expect(response.teacherId).toBe(vote.teacherId);
      expect(response.vote).toBe(vote.vote);
    });

    const req = httpMock.expectOne(`${baseURL}/votes`);
    expect(req.request.method).toBe('POST');
    req.flush(mockVoteResponse);
  });

  it('should submit absence justification', () => {
    const justification = {
      teacherId: 't1',
      className: '3INFO1',
      reason: 'maladie',
      details: 'Grippe'
    };

    const mockResponse = {
      id: 'abs1',
      ...justification,
      timestamp: new Date(),
      status: 'pending' as const
    };

    service.submitAbsenceJustification(justification).subscribe(response => {
      expect(response.teacherId).toBe(justification.teacherId);
      expect(response.reason).toBe(justification.reason);
      expect(response.status).toBe('pending');
    });

    const req = httpMock.expectOne(`${baseURL}/absences`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should handle local storage operations', () => {
    const testData = { test: 'data' };
    const key = 'test-key';

    service.saveToLocalStorage(key, testData);
    const retrieved = service.getFromLocalStorage(key);
    
    expect(retrieved).toEqual(testData);

    service.clearLocalStorage();
    const afterClear = service.getFromLocalStorage(key);
    expect(afterClear).toBeNull();
  });
});
