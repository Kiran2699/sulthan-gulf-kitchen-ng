import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMenuActionsComponent } from './admin-menu-actions.component';

describe('AdminMenuActionsComponent', () => {
  let component: AdminMenuActionsComponent;
  let fixture: ComponentFixture<AdminMenuActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminMenuActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminMenuActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
