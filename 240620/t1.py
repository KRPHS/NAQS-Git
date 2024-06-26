import sys
from PyQt5.QtWidgets import QApplication, QWidget, QVBoxLayout, QGridLayout, QPushButton, QLineEdit
from PyQt5.QtCore import Qt  # 추가

class Calculator(QWidget):
    def __init__(self):
        super().__init__()

        self.initUI()

    def initUI(self):
        self.setWindowTitle('계산기')
        self.setGeometry(100, 100, 320, 400)

        self.layout = QVBoxLayout()

        self.display = QLineEdit()
        self.display.setReadOnly(True)
        self.display.setAlignment(Qt.AlignRight)
        self.display.setFixedHeight(50)
        self.layout.addWidget(self.display)

        self.buttons_layout = QGridLayout()
        buttons = [
            ('AC', 0, 0), ('+/-', 0, 1), ('%', 0, 2), ('÷', 0, 3),
            ('7', 1, 0), ('8', 1, 1), ('9', 1, 2), ('×', 1, 3),
            ('4', 2, 0), ('5', 2, 1), ('6', 2, 2), ('-', 2, 3),
            ('1', 3, 0), ('2', 3, 1), ('3', 3, 2), ('+', 3, 3),
            ('0', 4, 0, 1, 2), ('.', 4, 2), ('=', 4, 3),
        ]

        for btn_text, x, y, *opt in buttons:
            btn = QPushButton(btn_text)
            btn.clicked.connect(self.on_click)
            self.buttons_layout.addWidget(btn, x, y, *(opt if opt else (1, 1)))

        self.layout.addLayout(self.buttons_layout)
        self.setLayout(self.layout)

    def on_click(self):
        sender = self.sender().text()
        current_text = self.display.text()

        if sender == 'AC':
            self.display.clear()
        elif sender == '+/-':
            if current_text.startswith('-'):
                self.display.setText(current_text[1:])
            else:
                self.display.setText('-' + current_text)
        elif sender == '%':
            self.display.setText(str(float(current_text) / 100))
        elif sender == '=':
            try:
                result = eval(current_text.replace('÷', '/').replace('×', '*'))
                self.display.setText(str(result))
            except:
                self.display.setText('Error')
        else:
            self.display.setText(current_text + sender)

if __name__ == '__main__':
    app = QApplication(sys.argv)
    calc = Calculator()
    calc.show()
    sys.exit(app.exec_())
