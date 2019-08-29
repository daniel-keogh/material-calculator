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
  constructor(private snackBar: MatSnackBar, private opPipe: OperatorSymbolPipe) { }

  ngOnInit() {
    this.clearDisplay();
  }

  @HostListener('document:keyup', ['$event.key'])
  onKeyUp(key: string) {
    const findBtn = (): MatButton => {
      if (key.match(OPERATORS))
        return this.matBtns.find(b => b._elementRef.nativeElement.textContent === this.opPipe.transform(key)); 
      else
        return this.matBtns.find(b => b._elementRef.nativeElement.textContent === key);
    };
    const ripple = (btn: MatButton) => { btn.ripple.launch(null) };

    if ((+key >= 0 && +key <= 9) || key === '.') {
      this.onNumClicked(key);
    } 
    else if (key.match(OPERATORS)) {
      this.onOpClicked(key);
    }
    else if (key === '(' || key === ')') {
      this.expression += key;
      return;
    }
    else if (key === '=') {
      this.onEqualsClicked();
    } 
    else if (key === 'Backspace') {
      this.onBackSpaceClicked();
      ripple(this.backspace);
      return;
    } 
    else if (key.toUpperCase() === 'C') {
      key = 'C';
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
      if (!this.expression[this.expression.length - 1].match(OPERATORS) && !lastNum.includes('.')) {
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
    if (this.expression[this.expression.length - 1].match(/[-+.*^\/]/)) {
      this.expression = this.expression.slice(0, -1) + operator;
    }
    else {
      this.expression += operator;
    }
  }

  onEqualsClicked() {
    // if last character is not an operator (or decimal point)
    if (!this.expression[this.expression.length - 1].match(/[-+.*^\/]/)) {
      this.summary = this.expression;

      try {
        this.checkParens();
      }
      catch(e) {
        this.invalidExpression("Unbalanced parentheses.");
        return;
      }
      
      try {
        const ans = evaluate(this.expression);

        if (isFinite(ans)) {
          this.expression = ans.toString();
        }
        else {
          this.invalidExpression(ans);
        }
      } 
      catch(e) {
        this.invalidExpression();
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

  checkParens() {
    const parenStack: string[] = [];

    [...this.expression].forEach(value => {
      switch (value) {
        case '(':
          parenStack.push(value);
          break;
        case ')':
          if (parenStack.length > 0) {
            parenStack.pop();
          }
          else {
            throw new Error();
          }
          break;
        default: 
          break;
      }
    });

    // Stack still not empty
    if (parenStack.length > 0)
      throw new Error();
  }

  invalidExpression(errMsg?: any) {
    this.expression = '0';
    this.snackBar.open(`Invalid Expression${errMsg ? ': '+ errMsg : ''}`, null, {
      duration: 3000,
      verticalPosition: 'bottom'
    });
  }
}