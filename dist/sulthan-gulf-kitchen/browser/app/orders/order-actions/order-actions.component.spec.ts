import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderActionsComponent } from './order-actions.component';

describe('OrderActionsComponent', () => {
  let component: OrderActionsComponent;
  let fixture: ComponentFixture<OrderActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
