import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodMenusComponent } from './food-menus.component';

describe('FoodMenusComponent', () => {
  let component: FoodMenusComponent;
  let fixture: ComponentFixture<FoodMenusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodMenusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FoodMenusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
