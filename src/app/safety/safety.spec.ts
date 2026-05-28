import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Safety } from './safety';

describe('Safety', () => {
  let component: Safety;
  let fixture: ComponentFixture<Safety>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Safety]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Safety);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
