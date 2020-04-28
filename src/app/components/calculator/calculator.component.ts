import {
  Component,
  OnInit,
  HostListener,
  ViewChildren,
  ViewChild,
  QueryList,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RippleRef, RippleConfig } from '@angular/material/core';
import { OperatorSymbolPipe } from '../../pipes/operator-symbol/operator-symbol.pipe';
import { evaluate } from 'mathjs';

const OPERATORS: RegExp = /[-+*^\/]/;

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss'],
})
export class CalculatorComponent implements OnInit {
  summary: string;
  expression: string;
  rippleRef: RippleRef;

  @ViewChild('backspace') backspace: MatButton;
  @ViewChildren(MatButton) matBtns: QueryList<MatButton>;
  constructor(
    private snackBar: MatSnackBar,
    private opPipe: OperatorSymbolPipe
  ) {}

  ngOnInit() {
    this.clearDisplay();
  }

  @HostListener('document:keyup', ['$event.key'])
  onKeyUp(key: string) {
    if (+key >= 0 && +key <= 9) {
      this.onNumClicked(key);
    } else if (key.match(OPERATORS)) {
      this.onOpClicked(key);
    } else if (key === '=') {
      this.onEqualsClicked();
    } else if (key === '.') {
      this.onDecimalClicked();
    } else if (key === 'Backspace') {
      this.onBackSpaceClicked();
    } else if (key === '(' || key === ')') {
      if (this.expression === '0' && key === '(') {
        this.expression = this.expression.slice(0, -1) + '(';
      } else {
        this.expression += key;
      }
    } else if (key.toUpperCase() === 'C') {
      key = 'C';
      this.clearDisplay();
    }

    this.rippleRef?.fadeOut();
  }

  @HostListener('document:keydown', ['$event.key', '$event.repeat', '$event'])
  onKeyDown(key: string, repeat: boolean, e: any) {
    if (repeat) {
      // Stop browser going back
      if (key === 'Backspace') {
        e.preventDefault();
      }
    } else {
      this.rippleRef?.fadeOut();

      const conf: RippleConfig = { centered: true, persistent: true };

      // Ripple the button
      if (key === 'Backspace') {
        this.rippleRef = this.backspace.ripple.launch(conf);
        e.preventDefault();
      } else {
        const isOp: boolean = !!key.match(OPERATORS);
        key = key.toUpperCase();

        this.rippleRef = this.matBtns
          .find((btn) => {
            const text = btn._elementRef.nativeElement.textContent;
            return text === (isOp ? this.opPipe.transform(key) : key);
          })
          ?.ripple.launch(conf);
      }
    }
  }

  onNumClicked(num: string) {
    // The last number(s) that follows an operator
    const lastNum = this.expression.split(OPERATORS).pop();

    if (lastNum === '0') {
      // Prevent numbers with leading zeros
      this.expression = this.expression.slice(0, -1) + num;
    } else {
      this.expression += num;
    }
  }

  onOpClicked(operator: string) {
    const last = this.expression[this.expression.length - 1];

    // If the last char was already an operator (or a decimal point), replace it with the new operator
    if (last.match(OPERATORS) || last === '.') {
      this.expression = this.expression.slice(0, -1) + operator;
    } else {
      this.expression += operator;
    }
  }

  onDecimalClicked() {
    // The last number(s) that follows an operator
    const lastNum = this.expression.split(OPERATORS).pop();

    if (
      !this.expression[this.expression.length - 1].match(OPERATORS) &&
      !lastNum.includes('.')
    ) {
      this.expression += '.';
    }
  }

  onBackSpaceClicked() {
    if (this.expression.length === 1) {
      this.clearDisplay();
    } else {
      this.expression = this.expression.slice(0, -1);
    }
  }

  onEqualsClicked() {
    const last = this.expression[this.expression.length - 1];

    if (!(last.match(OPERATORS) || last === '.')) {
      this.summary = this.expression;

      if (!this.checkParens()) {
        this.invalidExpression('Unbalanced Parentheses');
      }

      try {
        const ans = evaluate(this.expression);

        if (isFinite(ans)) {
          this.expression = ans.toString();
        } else {
          this.invalidExpression(ans);
        }
      } catch (e) {
        this.invalidExpression();
      }
    }
  }

  checkParens(): boolean {
    const parenStack: string[] = [];

    for (const value of [...this.expression]) {
      if (value === '(') {
        parenStack.push(value);
      } else if (value === ')') {
        if (parenStack.length > 0) {
          parenStack.pop();
        } else {
          return false;
        }
      }
    }

    return parenStack.length === 0;
  }

  invalidExpression(errMsg?: string) {
    this.expression = '0';
    this.snackBar.open(
      `Invalid Expression${errMsg ? ': ' + errMsg : ''}`,
      null,
      {
        duration: 3000,
        verticalPosition: 'bottom',
      }
    );
  }

  clearDisplay() {
    this.expression = '0';
    this.summary = null;
  }
}
