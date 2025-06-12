import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFoodMenuComponent } from './admin-food-menu.component';

describe('AdminFoodMenuComponent', () => {
  let component: AdminFoodMenuComponent;
  let fixture: ComponentFixture<AdminFoodMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminFoodMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminFoodMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
