import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickRatiosComponent } from './quick-ratios.component';

describe('QuickRatiosComponent', () => {
  let component: QuickRatiosComponent;
  let fixture: ComponentFixture<QuickRatiosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickRatiosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QuickRatiosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
