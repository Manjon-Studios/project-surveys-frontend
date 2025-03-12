import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionHostComponent } from './question-host.component';

describe('QuestionHostComponent', () => {
  let component: QuestionHostComponent;
  let fixture: ComponentFixture<QuestionHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionHostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
