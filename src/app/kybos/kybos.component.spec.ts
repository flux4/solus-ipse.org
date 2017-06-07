import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KybosComponent } from './kybos.component';

describe('KybosComponent', () => {
  let component: KybosComponent;
  let fixture: ComponentFixture<KybosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KybosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KybosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
