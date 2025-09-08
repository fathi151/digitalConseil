import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { CouncilManagementComponent } from './council-management.component';
import { CouncilManagementService } from './council-management.service';

import { getTestConfig } from '../testing/test-helpers';
describe('CouncilManagementComponent', () => {
  let component: CouncilManagementComponent;
  let fixture: ComponentFixture<CouncilManagementComponent>;
  let service: CouncilManagementService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      ...getTestConfig(),
      declarations: [ CouncilManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CouncilManagementComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(CouncilManagementService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default data', () => {
    expect(component.councilSessions).toBeDefined();
    expect(component.councils).toBeDefined();
    expect(component.statistics).toBeDefined();
  });

  it('should generate token correctly', () => {
    const token = component.generateToken();
    expect(token).toBeDefined();
    expect(token.length).toBe(8);
    expect(typeof token).toBe('string');
  });

  it('should validate status labels', () => {
    expect(component.getStatusLabel('active')).toBe('En cours');
    expect(component.getStatusLabel('closed')).toBe('Fermé');
    expect(component.getStatusLabel('pending')).toBe('En attente');
  });

  it('should handle modal operations', () => {
    // Test token modal
    component.openTokenModal();
    expect(component.showTokenModal).toBe(true);
    expect(component.accessToken).toBe('');

    component.closeTokenModal();
    expect(component.showTokenModal).toBe(false);

    // Test absence modal
    component.justifyAbsence('3INFO1');
    expect(component.showAbsenceModal).toBe(true);

    component.closeAbsenceModal();
    expect(component.showAbsenceModal).toBe(false);
  });

  it('should handle council session management', () => {
    const initialCouncil = component.councils.find(c => c.className === '3INFO2');
    expect(initialCouncil?.status).toBe('pending');

    component.startCouncilForClass('3INFO2');
    const updatedCouncil = component.councils.find(c => c.className === '3INFO2');
    expect(updatedCouncil?.status).toBe('active');
    expect(updatedCouncil?.startTime).toBeDefined();
  });

  it('should handle voting correctly', () => {
    const studentId = 'test-student';
    const initialVoteCount = component.votes.length;

    component.voteForStudent(studentId, 'approve');
    expect(component.votes.length).toBe(initialVoteCount + 1);
    expect(component.hasVoted(studentId)).toBe(true);

    // Should not allow double voting
    component.voteForStudent(studentId, 'reject');
    expect(component.votes.length).toBe(initialVoteCount + 1); // Should not increase
  });

  it('should calculate statistics correctly', () => {
    component.calculateStatistics();
    expect(component.statistics.successRate).toBeGreaterThan(0);
    expect(component.statistics.specialCases).toBeGreaterThanOrEqual(0);
  });
});
