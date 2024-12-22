import { TestBed } from '@angular/core/testing';

import { GlobalSettingsServiceService } from './global-settings-service.service';

describe('GlobalSettingsServiceService', () => {
  let service: GlobalSettingsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalSettingsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
