import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GenerosMusic } from 'src/app/interfaces/generos.interface';
import { Users } from 'src/app/pages/funcionarios/interfaces/users.interface';
import { UsersService } from 'src/app/pages/funcionarios/services/users.service';
import { ErrorLogsService } from 'src/app/services/error-logs.service';
import { ValidatorsService } from 'src/app/services/validators.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  items = [
    {name: "MUSICA FOLCLORICA NACIONAL" , code: 'MUSICA FOLCLORICA NACIONAL'},
    {name: "MUSICA LATINOAMERICANA",  code: 'MUSICA LATINOAMERICANA'}
 ];

  loading: boolean = false;
  expRegValid: RegExp = /^[^<>*!$~@%^&.`'¡":;+¥¿?=]/;
  public userForm: FormGroup = this.fb.group({
    id_user: [''],
    nombre: [ '', [ Validators.required, Validators.minLength(4), Validators.maxLength(75),this.validadorService.isSpacesInDinamicTxt],],
    cantintegrantes: ['',[Validators.required,Validators.min(1), Validators.max(50)]],
    generomusical:  [null,[Validators.required]],
    nombrerepre: [ '', [ Validators.required, Validators.minLength(3), Validators.maxLength(170),this.validadorService.isSpacesInDinamicTxt],],
    cellphone:['',[Validators.required,Validators.min(9999999), Validators.max(999999999)]],
    email: ['',[Validators.required, Validators.pattern(this.validadorService.emailPattern)]],
    status:[true],

  });


  public editSubs!: Subscription;

  constructor(
    public userService: UsersService,
    private validadorService :ValidatorsService,
    private errorLogsService: ErrorLogsService,
    private fb: FormBuilder,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.editSubs = this.userService.editSubs

        .subscribe((resp: Users) => {
          this.userForm.reset({
            id_user: resp.id,
            nombre: resp.nombre,
            cantintegrantes: resp.cantintegrantes,
            generomusical:resp.generomusical,
            nombrerepre: resp.nombrerepre,
            cellphone: resp.cellphone,
            email: resp.email,
            status: true
          });
        });

  }


  ngOnDestroy(): void {
    this.editSubs.unsubscribe();
  }
  closeModal() {
    this.userService.setModalUser = false;
  }

  saveUser() {
    this.userForm.markAllAsTouched();
    if(this.userForm.invalid){
      return;
    }
    this.loading = true;
    this.userService.postNewUsers(this.userForm.value).subscribe({

      complete: () => {
        this.userService.saving.next(true);

        this.closeModal();
        Swal.fire({ title: 'Exito', text: 'Registro creado correctamente', icon: 'success',
            showClass: { popup: 'animated animate fadeInDown' },
        });
        this.loading = false;
      },
      error: (err) => {
        const errors = err.error.errors;
        const msg = errors.email ? 'El Correo electrónico ya esta en uso' : errors.ci ? 'El Numero de carnet ya esta en uso' : 'Los datos no son validos, Intenta nuevamente';
        this.errorLogsService.logDeErrores(err, () => {
          Swal.fire({
            title:  'Oops...',
            text: msg,
            icon: 'info',
            target: 'form',
            showClass: { popup: 'animated animate fadeInDown' },
          });

          this.loading = false;

        });

      },

    });
  }

  messageError(campo: string, isNumber: boolean = false): string{
    const error = this.userForm.get(campo)?.errors;
    return this.validadorService.messageError(error, isNumber);
  }

  inputValid(campo: string) : boolean {
    if(this.userForm.get(campo)?.invalid && this.userForm.get(campo)?.touched){
      return true;
    } else {
      return false;
    }
  }
  resetuserForm() {
    this.userForm.reset({
      id_user: '',
      ci: '',
      name: '',
      paternal: '',
      maternal: '',
      cellphone: '',
      email: '',
      password: '',
      status: true,
    });
  }

}
