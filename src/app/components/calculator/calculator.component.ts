import { Component, OnInit, HostListener, ViewChildren, ViewChild, QueryList } from '@angular/core';
import { MatButton, MatSnackBar } from '@angular/material';
import { OperatorSymbolPipe } from '../../pipes/operator-symbol/operator-symbol.pipe';
import { evaluate } from 'mathjs';

const OPERATORS: RegExp = /[-+*^\/]/;

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss']
})
export class CalculatorComponent implements OnInit {

  summary: string;
  expression: string;

  @ViewChild('backspace', {static: false}) backspace: MatButton;
  @ViewChildren(MatButton) matBtns: QueryList<MatButton>;
  constructor(private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.clearDisplay();
  }

  @HostListener('document:keyup', ['$event.key'])
  onKeyUp(key: string) {
    const findBtn = (): MatButton => {
      if (key.match(OPERATORS) !== null) {
        const op = new OperatorSymbolPipe();
        return this.matBtns.find(b => b._elementRef.nativeElement.textContent === op.transform(key));
      } 
      else {
        return this.matBtns.find(b => b._elementRef.nativeElement.textContent === key);
      }
    };
    const ripple = (btn: MatButton) => { btn.ripple.launch(null) };

    if ((+key >= 0 && +key <= 9) || key === '.') {
      this.onNumClicked(key);
    } 
    else if (key.match(OPERATORS) !== null) {
      this.onOpClicked(key);
    } 
    else if (key === '=') {
      this.onEqualsClicked();
    } 
    else if (key === 'Backspace') {
      this.onBackSpaceClicked();
      ripple(this.backspace);
      return;
    } 
    else if (key === 'C') {
      this.clearDisplay();
    } 
    // key not on keyboard
    else {
      return;
    }

    ripple(findBtn());
  }

  onNumClicked(num: any) {
    const lastNum = this.expression.split(OPERATORS).pop(); // the last number(s) that follows an operator

    if (num === '.') {
      // if the last character isn't an operator and the current number doesn't already contain a decimal point
      if (this.expression[this.expression.length - 1].match(OPERATORS) === null && !lastNum.includes('.')) {
        this.expression += num;
      }
    } 
    else if (lastNum === '0') {
      // replace a zero that follows an operator with num instead
      this.expression = this.expression.slice(0, -1) + num;
    } 
    else {
      this.expression += num;
    }
  }

  onOpClicked(operator: string) {
    // if the last char was already an operator (or a decimal point), replace it with the new operator
    if (this.expression[this.expression.length - 1].match(/[-+.*^\/]/) !== null) {
      this.expression = this.expression.slice(0, -1) + operator;
    }
    else {
      this.expression += operator;
    }
  }

  onEqualsClicked() {
    // if last character is not an operator (or decimal point)
    if (this.expression[this.expression.length - 1].match(/[-+.*^\/]/) === null) {
      this.summary = this.expression;

      let ans: number;
      try {
        ans = evaluate(this.expression);
      } 
      finally {
        if (isFinite(ans)) {
          this.expression = ans.toString();
        }
        else {
          this.invalidExpression(ans);
        }
      }
    }
  }

  onBackSpaceClicked() {
    if (this.expression.length === 1) {
      this.clearDisplay();
    } 
    else {
      this.expression = this.expression.slice(0, -1);
    }
  }

  clearDisplay() {
    this.expression = '0';
    this.summary = null;
  }

  invalidExpression(ans: any) {
    this.expression = '0';
    this.snackBar.open(`Invalid Expression: ${ans}`, null, {
      duration: 3000,
      verticalPosition: 'bottom',
    });
  }
}
