import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from "@angular/router";
import { User } from "../../models/user";
import { UserService } from "../../services/user.service";
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [UserService]
})
export class LoginComponent implements OnInit {
  public title: string
  public user: User
  public status: string 

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService
  ) {
    this.title = "Identificate"
    this.user = new User("", "", "", "", "", "", "ROLE_USER", "")
  }

  ngOnInit() {
  }

  onSubmit(form: NgForm) {
    console.log(this.user)
    // debugger;
    // this._userService.register(this.user).subscribe(response => {
    //   if (response.user && response.user._id) {
    //     console.log(response)
    //     form.reset()
    //     this.status = 'success'
    //   }else{
    //     this.status = 'error'
    //   }
    // }, error => {
    //   console.log(<any>error)
    // })
  }

}
