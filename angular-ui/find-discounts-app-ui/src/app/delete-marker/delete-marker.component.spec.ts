import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteMarkerComponent } from './delete-marker.component';

describe('DeleteMarkerComponent', () => {
  let component: DeleteMarkerComponent;
  let fixture: ComponentFixture<DeleteMarkerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteMarkerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteMarkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
