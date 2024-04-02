import { TestBed } from '@angular/core/testing';

import { HandlerDataService } from './handler-data.service';

describe('HandlerDataService', () => {
  let service: HandlerDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HandlerDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
