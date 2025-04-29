import {Component, Injector, Input, OnChanges, OnInit, SimpleChanges, Type, ViewEncapsulation} from '@angular/core';
import {IQuestion} from "../../../auth/survey-edit/services/survey-edit.service";
import {FormControl, FormGroup} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {SingleChoiceComponent} from "../../../../components/single-choice/single-choice.component";
import {MultipleChoiceComponent} from "../../../../components/multiple-choice/multiple-choice.component";
import {TextChoiceComponent} from "../../../../components/text-choice/text-choice.component";
import {CONFIG_TOKEN} from "../../../../components/question-host/question-host.component";

@Component({
  selector: 'question-page',
  imports: [
    CommonModule,
  ],
  standalone: true,
  templateUrl: './question-page.component.html',
  styleUrl: './question-page.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class QuestionPageComponent implements OnChanges, OnInit {
  @Input() question!: IQuestion;
  @Input() form!: FormGroup | null;

  component: Type<any> | null = null;
  injector: Injector | undefined = undefined;
  formControl!: FormControl;

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    const componentsMap: Record<string, Type<any>> = {
      singleChoice: SingleChoiceComponent,
      multipleChoice: MultipleChoiceComponent,
      textChoice: TextChoiceComponent,
    }

    this.component = componentsMap[this.question.type];

    if (this.component) {
      if(this.form) {
        if(this.form?.get(this.question.id)) {
          this.formControl = this.form.get(this.question.id) as FormControl;
        } else {
          this.formControl = new FormControl([]);
          this.form.addControl(this.question.id, this.formControl);
        }
      }

      this.question.config = {
        ...this.question.config,
        required: this.question.isRequired,
      }

      this.injector = Injector.create({
        providers: [
          {
            provide: CONFIG_TOKEN,
            useValue: this.question.config
          },
          {
            provide: FormControl,
            useValue: this.formControl || null,
          },
        ]
      });
    }
  }

  getErrorMessage(): string {
    if (!this.formControl) return '';
    if (this.formControl.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (this.formControl.hasError('minlength')) {
      return `Debe seleccionar al menos AAA opciones`;
    }
    if (this.formControl.hasError('maxlength')) {
      return `Ha sobre pasado el máximo de caracteres permitidos`;
    }
    return '';
  }
}
