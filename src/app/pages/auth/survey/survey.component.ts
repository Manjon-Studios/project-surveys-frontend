import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

export interface Root {
  surveys: Survey[]
  status: number
}

export interface Survey {
  _id: string
  title: string
  __v: number
}

@Component({
  selector: 'c-survey',
  imports: [
    CommonModule,
    RouterLink
  ],
  standalone: true,
  templateUrl: './survey.component.html',
  styleUrl: './survey.component.scss'
})
export class SurveyComponent implements OnInit {
  public surveys!: Survey[];
  public isLoading = false;

  constructor(private httpClient: HttpClient) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.httpClient.get<Survey[]>('http://localhost:3002/survey/all')
    .subscribe((surveys: Survey[]) => {
      this.surveys = surveys;
      console.log(this.surveys)
      this.isLoading = false;
    })
  }
}
