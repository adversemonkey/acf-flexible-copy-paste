# acf-flexible-copy-paste
A WordPress plugin that lets you copy and paste flexible layouts between pages.
This plugin only uses JS to handle the copy/paste feature, allowing you to manage the process more naturally from the frontend and freely work on the page and layouts.

<img width="442" alt="immagine" src="https://github.com/user-attachments/assets/ebf318d8-fd7a-4c8b-81b1-dd3a8e04ee78">
<br />
<img width="193" alt="immagine" src="https://github.com/user-attachments/assets/00f2d9f5-5dc7-4988-9dc9-c7dc76f0e69f">

# To do
The copy don't work yet with the following field types: relationship, post, radio, datepicker, timepicker

# Nice to have
It should be better to use ACF's public native functions (acf.getField) to set the values of the fields in the ACFCP_compileField function.  
It has already been done with the types: link, color picker, gallery.  
Maybe it could be done in the getting values function (ACFCP_fieldGetData).
