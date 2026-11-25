import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const categories = [
  ['Tecnología', 'Dispositivos y periféricos para el trabajo y el entretenimiento.'],
  ['Hogar y cocina', 'Utensilios y accesorios para organizar y equipar el hogar.'],
  ['Accesorios', 'Complementos prácticos para el día a día.'],
  ['Deportes', 'Accesorios para entrenar y realizar actividad física.'],
  ['Oficina y estudio', 'Artículos para estudiar y organizar el espacio de trabajo.'],
];
const rows = [
  ['Audífonos inalámbricos Urban', 'Escucha música y atiende llamadas con estos audífonos inalámbricos de diseño compacto. Incluyen estuche de carga para llevarlos contigo.', 'Tecnología', 89.90, 18, 'true'],
  ['Mouse inalámbrico Comfort', 'Mouse inalámbrico con rueda de desplazamiento y diseño cómodo para trabajar o estudiar. Una opción práctica para tu escritorio.', 'Tecnología', 39.90, 25, 'true'],
  ['Teclado compacto Essential', 'Teclado de distribución compacta para aprovechar mejor el escritorio. Ideal para escribir, estudiar y realizar tareas cotidianas.', 'Tecnología', 69.90, 14, 'true'],
  ['Parlante portátil Mini', 'Lleva tu música a tus espacios favoritos con este parlante portátil de tamaño compacto y conexión inalámbrica.', 'Tecnología', 79.90, 12, 'true'],
  ['Organizador de cocina de dos niveles', 'Organiza especias, frascos y utensilios pequeños en dos niveles. Su diseño ayuda a mantener la encimera ordenada y todo a la vista.', 'Hogar y cocina', 49.90, 16, 'true'],
  ['Set de utensilios de silicona', 'Prepara tus recetas con este juego de utensilios de silicona. Una selección de piezas prácticas para mezclar, servir y cocinar.', 'Hogar y cocina', 59.90, 20, 'true'],
  ['Botella térmica de 750 ml', 'Botella térmica de 750 ml con tapa de rosca. Llévala al trabajo, a clases o a tus paseos para tener tu bebida siempre a mano.', 'Hogar y cocina', 45.90, 24, 'true'],
  ['Recipientes herméticos de tres piezas', 'Juego de tres recipientes con tapa para guardar alimentos y organizar la cocina. Prácticos para separar porciones y aprovechar el espacio.', 'Hogar y cocina', 34.90, 22, 'true'],
  ['Mochila urbana Daily', 'Mochila con compartimento principal y bolsillo frontal para organizar tus objetos personales. Un complemento versátil para tu rutina.', 'Accesorios', 89.90, 15, 'true'],
  ['Billetera plegable Classic', 'Billetera plegable con espacios para tarjetas y billetes. Su formato compacto facilita llevar lo esencial en el bolsillo.', 'Accesorios', 39.90, 28, 'true'],
  ['Gorra ajustable Basic', 'Gorra de estilo casual con ajuste posterior para adaptar el calce. Fácil de combinar con tus prendas de uso diario.', 'Accesorios', 29.90, 30, 'true'],
  ['Bolso cruzado Compact', 'Bolso cruzado con cierre y correa ajustable para llevar el celular, la billetera y otros objetos pequeños durante tus salidas.', 'Accesorios', 54.90, 17, 'true'],
  ['Mat de yoga de 6 mm', 'Mat de 6 mm para yoga, estiramientos y ejercicios de piso. Se enrolla para facilitar su traslado y almacenamiento.', 'Deportes', 49.90, 19, 'true'],
  ['Set de bandas de resistencia', 'Bandas de resistencia para complementar ejercicios de fuerza y movilidad. Un accesorio compacto para variar tus rutinas.', 'Deportes', 35.90, 26, 'true'],
  ['Cuerda para saltar ajustable', 'Cuerda de longitud ajustable para incorporar saltos a tu entrenamiento. Ligera y fácil de guardar en el bolso deportivo.', 'Deportes', 19.90, 32, 'true'],
  ['Mancuernas de 2 kg por par', 'Par de mancuernas de 2 kg cada una para ejercicios de fuerza y acondicionamiento. Prácticas para entrenar en casa.', 'Deportes', 59.90, 10, 'true'],
  ['Cuaderno A5 de tapa rígida', 'Cuaderno de formato A5 y tapa rígida para apuntes, ideas y pendientes. Su tamaño es cómodo para llevar en la mochila.', 'Oficina y estudio', 18.90, 40, 'true'],
  ['Organizador de escritorio Modular', 'Organizador con compartimentos para lapiceros y accesorios pequeños. Mantén tus útiles a mano y despeja tu espacio de trabajo.', 'Oficina y estudio', 29.90, 23, 'true'],
  ['Lámpara de escritorio LED', 'Ilumina tu espacio de lectura y trabajo con esta lámpara LED de escritorio. Su diseño compacto se adapta a mesas de estudio.', 'Oficina y estudio', 64.90, 13, 'true'],
  ['Set de lapiceros de seis unidades', 'Juego de seis lapiceros para tomar apuntes, escribir y organizar tus tareas. Un básico para el estudio y la oficina.', 'Oficina y estudio', 12.90, 50, 'true'],
];
const headers = ['nombre', 'descripcion', 'categoria', 'precio', 'stock', 'activo'];
assert.equal(rows.length, 20);
assert.equal(new Set(rows.map(row => row[0] + '|' + row[2])).size, 20);
for (const row of rows) {
  assert(categories.some(([name]) => name === row[2]));
  assert(row[3] > 0 && Number.isInteger(row[4]) && row[4] > 0);
}
const quote = value => '"' + String(value).replaceAll('"', '""') + '"';
const csv = '\uFEFF' + [headers, ...rows.map(row => row.map((value, index) => index === 3 ? value.toFixed(2) : value))].map(row => row.map(quote).join(';')).join('\r\n') + '\r\n';
await fs.writeFile(path.join(dir, 'productos_importar.csv'), csv, 'utf8');

const workbook = Workbook.create();
const products = workbook.worksheets.add('Productos');
const guide = workbook.worksheets.add('Categorías y guía');
for (const sheet of [products, guide]) sheet.showGridLines = false;
products.tabColor = '#B8894A';
products.getRange('A1:F21').values = [headers, ...rows];
products.getRange('A1:F21').format.font = {name:'Arial', size:11, color:'#292524'};
products.getRange('A1:F21').format.verticalAlignment = 'center';
products.getRange('A1:F1').format = {fill:'#292524', font:{name:'Arial',size:11,bold:true,color:'#FFFFFF'},rowHeight:30,horizontalAlignment:'center'};
products.getRange('A2:C21').format.wrapText = true;
products.getRange('A2:F21').format.rowHeight = 68;
for(let row=2;row<=21;row++) if(row%2===0) products.getRange(`A${row}:F${row}`).format.fill = '#F7F6F2';
for(const [col,width] of [['A',35],['B',76],['C',25],['D',15],['E',12],['F',12]]) products.getRange(`${col}1:${col}21`).format.columnWidth = width;
products.getRange('D2:D21').setNumberFormat('"S/ "#,##0.00');
products.getRange('E2:E21').setNumberFormat('0');
products.getRange('F2:F21').format.horizontalAlignment = 'center';
products.getRange('C2:C21').dataValidation = {rule:{type:'list',values:categories.map(([name])=>name)}};
products.getRange('F2:F21').dataValidation = {rule:{type:'list',values:['true','false']}};
products.tables.add('A1:F21',true,'ProductosImportacion');
products.freezePanes.freezeRows(1);

guide.getRange('B2:D24').format.font = {name:'Arial',size:11,color:'#292524'};
guide.getRange('B2:B24').format.columnWidth = 31;
guide.getRange('C2:C24').format.columnWidth = 77;
guide.getRange('D2:D24').format.columnWidth = 15;
guide.getRange('B2').values = [['Preparación de la importación']];
guide.getRange('B2').format.font = {name:'Arial',size:16,bold:true,color:'#292524'};
guide.getRange('B4').values = [['Datos de ejemplo. Precios en soles y stock propuestos para probar la tienda.']];
guide.getRange('B4').format.font.italic = true;
guide.getRange('B6:D11').values = [['Categoría por crear','Descripción sugerida','Productos'],...categories.map(([name,description])=>[name,description,null])];
guide.getRange('B6:D6').format = {fill:'#292524',font:{name:'Arial',size:11,bold:true,color:'#FFFFFF'},horizontalAlignment:'center',rowHeight:28};
guide.getRange('B7:D11').format.rowHeight = 34;
guide.getRange('B7:D11').format.verticalAlignment = 'center';
guide.getRange('C7:C11').format.wrapText = true;
guide.getRange('D7:D11').formulas = categories.map((_,i)=>[`=COUNTIFS('Productos'!$C$2:$C$21,B${i+7})`]);
guide.getRange('D7:D11').setNumberFormat('0');
for(let row=7;row<=11;row++) if(row%2===1) guide.getRange(`B${row}:D${row}`).format.fill = '#F7F6F2';
const steps = [
  ['1. Crear categorías','Crea primero las cinco categorías de la tabla en el panel administrativo. Usa los mismos nombres y tildes. Si alguna ya existe, reutilízala.'],
  ['2. Importar el CSV','En Productos, pulsa Importar CSV y selecciona productos_importar.csv. El importador actual utiliza CSV, no archivos XLSX.'],
  ['3. Revisar y confirmar','Revisa la vista previa y confirma los 20 productos. Si hay errores o productos duplicados, corrige el archivo y vuelve a revisarlo.'],
  ['4. Agregar imágenes','Después de importar, abre Gestionar imágenes en cada producto. Puedes subir fotos, elegir la principal y eliminar las que ya no necesites.'],
  ['5. Preparar ofertas','Los productos se importan activos, con stock y sin oferta. Si deseas un descuento, configúralo después con Gestionar oferta.'],
  ['Editar desde Excel','La hoja Productos tiene las columnas del importador. Si cambias los datos en este Excel, guarda esa hoja como CSV UTF-8 antes de importarla.'],
];
guide.getRange('B14:C19').values = steps;
guide.getRange('B14:B19').format.font.bold = true;
guide.getRange('B14:C19').format.wrapText = true;
guide.getRange('B14:C19').format.verticalAlignment = 'center';
guide.getRange('B14:C19').format.rowHeight = 58;
workbook.recalculate();
for(const [i,category] of categories.entries()) assert.equal(guide.getRange(`D${i+7}`).values[0][0],4,category[0]);
console.log((await workbook.inspect({kind:'table',range:'Productos!A1:F4',include:'values',tableMaxRows:4,tableMaxCols:6,maxChars:2000})).ndjson);
console.log((await workbook.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!',options:{useRegex:true,maxResults:10},maxChars:1000})).ndjson);
for(const [sheetName,range,name] of [['Productos','A1:F6','productos-preview'],['Categorías y guía','B2:D19','guia-preview']]) {
  const blob = await workbook.render({sheetName,range,scale:1,format:'png'});
  await fs.writeFile(path.join(dir,'support',name+'.png'),new Uint8Array(await blob.arrayBuffer()));
}
await (await SpreadsheetFile.exportXlsx(workbook)).save(path.join(dir,'productos_20.xlsx'));
console.log('Created Excel and UTF-8 CSV: 20 products, 5 categories, 4 products per category.');
