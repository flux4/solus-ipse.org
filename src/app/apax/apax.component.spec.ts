import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApaxComponent } from './apax.component';

describe('ApaxComponent', () => {
  let component: ApaxComponent;
  let fixture: ComponentFixture<ApaxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApaxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
