import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from "@angular/router";
import { User } from "../../models/user";
import { UserService } from "../../services/user.service";
import { NgForm } from '@angular/forms/src/directives/ng_form';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [UserService]
})
export class RegisterComponent implements OnInit {
  public title: string
  public user: User
  public status: string 

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService
  ) {
    this.title = "Registrate"
    this.user = new User("", "", "", "", "", "", "ROLE_USER", "")
  }

  ngOnInit() {
  }

  onSubmit(form: NgForm) {
    debugger;
    this._userService.register(this.user).subscribe(response => {
      if (response.user && response.user._id) {
        console.log(response)
        form.reset()
        this.status = 'success'
      }else{
        this.status = 'error'
      }
    }, error => {
      console.log(<any>error)
    })
  }

}
