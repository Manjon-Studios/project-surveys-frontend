import { ChangeDetectionStrategy, Component, InjectionToken, Injector, Input, OnChanges, SimpleChanges, Type, ViewEncapsulation } from '@angular/core';
import { SingleChoiceComponent } from '../single-choice/single-choice.component';
import { CommonModule } from '@angular/common';
import { SurveyQuestion } from '../../pages/auth/survey-edit/survey-edit.component';
import { MultipleChoiceComponent } from '../multiple-choice/multiple-choice.component';
import { FormControl, FormGroup } from '@angular/forms';
import { TextChoiceComponent } from '../text-choice/text-choice.component';
import {IQuestion} from "../../pages/auth/survey-edit/services/survey-edit.service";
export const CONFIG_TOKEN = new InjectionToken<any>('config');
@Component({
  selector: 'question-host',
  imports: [
    CommonModule,
  ],
  standalone: true,
  templateUrl: './question-host.component.html',
  styleUrl: './question-host.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class QuestionHostComponent implements OnChanges {
  @Input()  question!: IQuestion;
  @Input() form!: FormGroup | null;

  component: Type<any> | null = null;
  injector: Injector | undefined = undefined;
  formControl!: FormControl;

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges changes', this.form?.controls);
    const componentsMap: Record<string, Type<any>> = {
      singleChoice: SingleChoiceComponent,
      multipleChoice: MultipleChoiceComponent,
      textChoice: TextChoiceComponent,
    }
    this.component = componentsMap[this.question.type];

    if (this.component) {
      if(this.form) {
        this.formControl = new FormControl([]);
        this.form.addControl(this.question.id, this.formControl);
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
