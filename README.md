# Some Code

    git clone https://github.com/krom-xr/new_comm_systems.git
    cd new_comm_systems
    python -m CGIHTTPServer 8080

В адресной строке браузера http://localhost:8080

Реализованы:
  - drag
  - авторасстановка блоков по высоте
  - цветовое выделение по значению свойсва. В том числе если свойсто содержит
  несколько значений
  - colorpicker (только для Chrome)
  - двухуровневая вложенность
  - фолдинг унфолдинг списков свойств

Протестировано в актуальных версиях браузеров
Firefox, Chrome, Safari, Opera


TODO:
 - Использован хак c setTimeout: directives.js:26
 - colorpicker работает только в Chrome и Opera
 - Плохой алгоритм для пересчета z-index-ов в блоках
