import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminStocksComponent } from './admin-stocks.component';

describe('AdminStocksComponent', () => {
  let component: AdminStocksComponent;
  let fixture: ComponentFixture<AdminStocksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminStocksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminStocksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
