import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { ColsTable, SearchFor } from 'src/app/interfaces/table.interface';
import { ErrorLogsService } from 'src/app/services/error-logs.service';
import Swal from 'sweetalert2';
import { Regsoli } from '../../../interfaces/regsoli.interface';
import { RegsoliService } from '../../../services/regsoli.service';


@Component({
  selector: 'app-table-funcionarios',
  templateUrl: './table-funcionarios.component.html',
  styles: [
  ]
})
export class TableRegsolisComponent implements OnInit, OnDestroy {


  cols: ColsTable[] = [
    { field: 'nameactor', header: 'NOMBRE A.' , style:'min-width:120px; max-width:130px;', tooltip: true},
    { field: 'typeConstitution', header: 'TIPO DE CONSTITUCION' , style:'min-width:250px;',tooltip: true },
    { field: 'projectPlace', header: 'UBICACION', style:'min-width:270px; max-width:270px;', tooltip: true},
    { field: 'yearExperience', header: 'AÑOS EXPERIENCIA', style:'min-width:270px; max-width:270px;', tooltip: true},
    { field: 'timeProposal', header: 'TIEMPO PROPUESTA', style:'min-width:270px; max-width:270px;', tooltip: true},
    { field: 'financing', header: 'FINANCIAMIENTO', style:'min-width:130px; max-width:130px', isButton:true},
    { field: 'status', header: 'OPCIONES', style:'min-width:130px; max-width:130px', isButton:true}
  ];
  searchFor: SearchFor[] = [
    {name: 'Nombre actor', code: 'nameactor'},

  ];
  searchSelect: string = 'nameactor';
  loading: boolean = true;
  rows: number = 50;
  from: number = 0;
  to: number = 0;
  total: number = 0;
  regSoli: Regsoli[]=[];
  @Input() status: boolean = true;
  heigthtable: string = '400px';
  isSearching:boolean = false;
  savingSubs!: Subscription;
  debouncer: Subject<string> = new Subject();
  txtTermino: UntypedFormControl = new UntypedFormControl();
  pipe = new DatePipe('en-US');
  constructor(
    private regsoliService: RegsoliService,
    private errorLogService: ErrorLogsService
  ) { }

  ngOnInit(): void {
    this.getAllRegsoli(this.status,1,this.rows);
    this.savingSubs = this.regsoliService.saving
        .subscribe(saving => {
          this.getAllRegsoli(this.status,1,this.rows);
        });
    this.debouncer.pipe( debounceTime(500))
        .subscribe(valor =>{
          this.getSearchRegsoli(this.searchSelect,this.status,this.rows,1,valor);
        });
  }

  ngOnDestroy(): void {
    this.debouncer.unsubscribe();
    this.savingSubs.unsubscribe();
  }


  getAllRegsoli(status: boolean, page: number, per_page: number) {
    this.loading = true;
    this.regsoliService.getAllRegsoli(status,page,per_page).subscribe({
      next: (resp) => {
        this.regSoli = resp.data;
        this.total = resp.total;
        this.from = resp.from;
        this.to = resp.to;
      },
      error: (err) => this.errorLogService.logDeErroresReads(err),
      complete: () => { this.loading = false; this.isSearching = false;}
    });
  }

  getSearchRegsoli(type:string, status:boolean, per_page: number, page:number, search: string) {
    this.regsoliService.getSearchRegsoli(type, per_page, page, search)
        .subscribe({
          next: (resp) => {
            this.regSoli = resp.data;
            this.total = resp.total;
            this.from = resp.from;
            this.to = resp.to;
          },
          error: (err) => this.errorLogService.logDeErroresReads(err),
          complete: () => this.isSearching = true
        });
  }

  searchDewey() {
    const txtInput = this.txtTermino.value;
    if(txtInput.length === 0) {
      this.getAllRegsoli(this.status,1,this.rows);
      return ;
    }
    if(this.searchSelect.length > 0) {
      this.debouncer.next(txtInput);
    }
  }

  paginate(event : any) {
    const page = event.page+1;
    const per_page = event.rows;
    this.heigthtable = per_page === 50 ? '400px' : '600px';
    if(this.isSearching){
      this.getSearchRegsoli(this.searchSelect,this.status,per_page,page,this.txtTermino.value);
    } else {
      this.getAllRegsoli(this.status, page , per_page);
    }
  }


  editDeweyShowModal(regsoli: Regsoli) {
    this.regsoliService.isEdit = true;
    this.regsoliService.editSubs.emit(regsoli);
    this.regsoliService.setModalRegsoli = true;
  }
  printPdf(regsoli: Regsoli){
    this.regsoliService.getNewPaginaPdfOpen(regsoli);
  }

  inactivarDewey(regsoli: Regsoli) {
    const regsoliServiceU = {...regsoli};
    Swal.fire({
      title: '¿Inactivar Registro?',
      text: `Esta apunto de inactivar a ${regsoliServiceU.nameactor}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Inactivar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        regsoliServiceU.status = 0;
        this.regsoliService.putActiveOrDestroyRegsoli(regsoliServiceU.id!,0).subscribe({
          error: (err) => this.errorLogService.logDeErroresReads(err),
          complete: () => {
            this.total = this.total -1;
            this.regSoli = this.regSoli.filter(resp => resp.id !== regsoliServiceU.id);
            Swal.fire(
              'Inactivado!',
              'Disponible en la sección de "Inactivos", Podra ver y/o activarlo en cualquier momento',
              'success'
            );
          }
        });

      }
    });
  }

  activarDewey(regSoli: Regsoli) {
    const regsoliServiceU = {...regSoli};
    Swal.fire({
      title: '¿Activar Registro?',
      text: `Esta apunto de Activar a ${regsoliServiceU.nameactor}`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Activar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.regsoliService.putActiveOrDestroyRegsoli(regsoliServiceU.id!,1).subscribe({
          error: (err) => this.errorLogService.logDeErroresReads(err),
          complete: () => {
            this.total = this.total -1;
            this.regSoli = this.regSoli.filter(resp => resp.id !== regsoliServiceU.id);
            Swal.fire(
              'Activado!',
              'Disponible en la sección de "Activos"',
              'success'
            );
          }
        });

      }
    });
  }


}
