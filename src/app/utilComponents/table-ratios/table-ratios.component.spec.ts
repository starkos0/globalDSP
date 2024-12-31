import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableRatiosComponent } from './table-ratios.component';

describe('TableRatiosComponent', () => {
  let component: TableRatiosComponent;
  let fixture: ComponentFixture<TableRatiosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableRatiosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableRatiosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
