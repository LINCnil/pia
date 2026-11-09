import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Structure } from 'src/app/models/structure.model';
import { AppDataService } from 'src/app/services/app-data.service';
import { StructureService } from 'src/app/services/structure.service';
import { EntriesModule } from '../../entries.module';
import { NewStructureComponent } from './new-structure.component';

describe('NewStructureComponent', () => {
  let component: NewStructureComponent;
  let fixture: ComponentFixture<NewStructureComponent>;
  let structureService: jasmine.SpyObj<StructureService>;
  const dataNav = { sections: [] };
  const savedStructure = Object.assign(new Structure(), { id: 12 });

  beforeEach(async () => {
    structureService = jasmine.createSpyObj('StructureService', ['create']);
    structureService.create.and.returnValue(Promise.resolve(savedStructure));

    await TestBed.configureTestingModule({
      imports: [EntriesModule, RouterTestingModule, TranslateModule.forRoot()],
      providers: [
        {
          provide: AppDataService,
          useValue: {
            dataNav,
            resetDataNav: jasmine.createSpy('resetDataNav'),
          },
        },
        { provide: StructureService, useValue: structureService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('initializes the structure form', () => {
    expect(TestBed.inject(AppDataService).resetDataNav).toHaveBeenCalled();
    expect(component.structureForm.value).toEqual({
      name: null,
      sector_name: null,
    });
    expect(fixture.nativeElement.querySelector('#name')).not.toBeNull();
  });

  it('creates a structure and emits the result', async () => {
    spyOn(component.submitted, 'emit');
    component.structureForm.setValue({
      name: 'Template',
      sector_name: 'Health',
    });

    component.onSubmit();
    await fixture.whenStable();

    expect(structureService.create).toHaveBeenCalled();
    const created = structureService.create.calls.mostRecent().args[0];
    expect(created.name).toBe('Template');
    expect(created.sector_name).toBe('Health');
    expect(created.data).toBe(dataNav);
    expect(component.submitted.emit).toHaveBeenCalledWith(savedStructure);
  });
});
