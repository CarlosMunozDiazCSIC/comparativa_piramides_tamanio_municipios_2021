let firstItem = 'Nacional', secondItem = ''; //Variables de selección

//Variables de visualización
let dataPyramid = [];
let centreSpacing = 45, 
    margin = { left: 20, right: 20, top: 10, bottom: 20 }, 
    h = document.getElementById('chart').clientHeight - margin.top - margin.bottom,
    w = document.getElementById('chart').clientWidth - margin.left - margin.right;
let svg, gM, gF, gM2, gF2, gLabels, y, x, xReverse;
let isSecondSet = false;

initData();

function initData() {
    d3.queue()
        .defer(d3.csv, "./data/piramides_tamanios_municipios.csv")
        .await(function(error, data1) {
        if (error) throw error;

            let data_muni = d3.nest()
                .key(function(d) { return d.nombre_muni; })
                .entries(data1);

            /////////
            ///////// Autocompletado
            let optGroupMun = document.createElement('OPTGROUP');
            optGroupMun.label = 'Tipo';

            for(let i = 0; i < data_muni.length; i++) {
                let elem = data_muni[i].key;
                let elemDom = document.createElement('option');
                elemDom.text = elem;

                optGroupMun.appendChild(elemDom);
            }
            let dupMun = optGroupMun.cloneNode(true);

            document.getElementById('listMunicipiosFirst').value = 'Nacional';
            document.getElementById('municipiosFirst').appendChild(optGroupMun);
            document.getElementById('municipiosSecond').appendChild(dupMun);
            /////////

            /////////Agrupamos todos los datos en un único array
            dataPyramid = [...data_muni];

            //// Por defecto, mostramos primero la pirámide nacional
            initPyramid(firstItem, secondItem);

            //// Recogida de selección de elementos
            document.getElementById('listMunicipiosFirst').addEventListener('change', function(e) {
                municipioSeleccionadoFirst(e.target.value);
            });
            document.getElementById('listMunicipiosSecond').addEventListener('change', function(e) {
                municipioSeleccionadoSecond(e.target.value);
            });
            
            function municipioSeleccionadoFirst(valor) {
                if(valor == '') {
                    firstItem = 'Nacional';
                    document.getElementById('listMunicipiosFirst').value = 'Nacional';
                } else {
                    firstItem = valor;
                }
                setPyramid(firstItem, secondItem);
            }

            function municipioSeleccionadoSecond(valor) {
                secondItem = valor;
                setPyramid(firstItem, secondItem);
            }

            function initPyramid(first) {
                let auxFirst = [];

                //Desarrollo de la pirámide principal
                //Filtrado de datos
                auxFirst = dataPyramid.filter(function(item) {
                    if(item.key == first) { return item; }
                })[0];
                auxFirst = auxFirst.values;

                //Visualización                
                svg = d3.select("#chart")
                    .append("svg")
                    .attr("width", w + margin.left + margin.right)
                    .attr("height", h + margin.top + margin.bottom);

                //Grupos para la visualización
                //Hombres
                gM = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                //Mujeres
                gF = svg.append("g").attr( "transform", "translate(" + (margin.left + (w - centreSpacing) / 2 + centreSpacing) + "," + margin.top + ")");
                //Elementos centrales
                gLabels = svg.append("g").attr("transform", "translate(" + (margin.left + (w - centreSpacing) / 2 + "," + margin.top + ")") );

                //Escalas
                y = d3.scaleBand().domain(auxFirst.map((d) => d.Edad)).range([h, 0]).padding(0.1);
                x = d3.scaleLinear().domain([0, 6]).range([0, (w - centreSpacing) / 2]); //Mujeres
                xReverse = d3.scaleLinear().domain([6, 0]).range([0, (w - centreSpacing) / 2]); //Hombres

                //Hombres
                gM.selectAll("rect")
                    .data(auxFirst)
                    .enter()
                    .append("rect")
                    .attr('class', 'rect-first-men')
                    .attr("x", (d) => (w - centreSpacing) / 2 - x(+d.porc_hombres))
                    .attr("y", (d) => y(d.Edad))
                    .attr("height", y.bandwidth())
                    .attr("width", (d) => x(+d.porc_hombres))
                    .style("fill", "#4e7e7e")
                    .style("opacity", 0.75);

                //Mujeres
                gF.selectAll("rect")
                    .data(auxFirst)
                    .enter()
                    .append("rect")
                    .attr('class', 'rect-first-women')
                    .attr("x", 0)
                    .attr("y", (d) => y(d.Edad))
                    .attr("height", y.bandwidth())
                    .attr("width", (d) => x(+d.porc_mujeres))
                    .style("fill", "#4e7e7e")
                    .style("opacity", 0.75);

                //Labels centrales
                gLabels
                    .selectAll("text")
                    .data(auxFirst)
                    .enter()
                    .append("text")
                    .attr('text-anchor', 'middle')
                    .attr("x", (centreSpacing / 2))
                    .attr("y", (d) => y(d.Edad) + 13.5)
                    .text(function(d, i) {
                        if(i == auxFirst.length - 1) {
                            return '100+';
                        } else {
                            if(i == 0) {
                                return '0-4';
                            } else if (i == 5) {
                                return '25-29';
                            } else if (i == 10) {
                                return '50-54';
                            } else if (i == 15) {
                                return '75-79';
                            } else {
                                return "";
                            }
                        }
                    });

                //Eje X - Mujeres
                gF.append("g")
                    .attr("transform", "translate(0," + (h + 3) + ")")
                    .call(d3.axisBottom(x).ticks(4, "s"));

                //Eje X - Hombres
                gM.append("g")
                    .attr("transform", "translate(0," + (h + 3) + ")")
                    .call(d3.axisBottom(xReverse).ticks(4, "s"));
            }

            function setPyramid(first, second) {
                let auxFirst = [], auxSecond = [];

                //Desarrollo de la pirámide principal
                //Filtrado de datos
                auxFirst = dataPyramid.filter(function(item) {
                    if(item.key == first) { return item; }
                })[0];
                auxFirst = auxFirst.values;

                //Visualización principal
                //Hombres
                gM.selectAll(".rect-first-men")
                    .data(auxFirst)
                    .transition()
                    .duration(1500)
                    .attr("x", (d) => (w - centreSpacing) / 2 - x(+d.porc_hombres))
                    //.attr("y", (d) => y(d.Edad))
                    //.attr("height", y.bandwidth())
                    .attr("width", (d) => x(+d.porc_hombres))
                    .style("fill", "#4e7e7e")
                    .style("opacity", 0.75);

                //Mujeres
                gF.selectAll(".rect-first-women")
                    .data(auxFirst)
                    .transition()
                    .duration(1500)
                    .attr("x", 0)
                    //.attr("y", (d) => y(d.Edad))
                    //.attr("height", y.bandwidth())
                    .attr("width", (d) => x(+d.porc_mujeres))
                    .style("fill", "#4e7e7e")
                    .style("opacity", 0.75);


                //Elemento comparativo
                if(second != '') {

                    auxSecond = dataPyramid.filter(function(item) {
                        if(item.key == second) { return item; }
                    })[0];
                    auxSecond = auxSecond.values;

                    if(isSecondSet) {
                        //Hombres
                        gM2.selectAll(".rect-second-men")
                            .data(auxSecond)
                            .transition()
                            .duration(1500)
                            .attr("x", (d) => (w - centreSpacing) / 2 - x(+d.porc_hombres))
                            //.attr("y", (d) => y(d.Edad))
                            //.attr("height", y.bandwidth())
                            .attr("width", '1.5px')
                            .style("fill", "red");

                        //Mujeres
                        gF2.selectAll(".rect-second-women")
                            .data(auxSecond)
                            .transition()
                            .duration(1500)
                            .attr("x", (d) => x(+d.porc_mujeres))
                            //.attr("y", (d) => y(d.Edad))
                            //.attr("height", y.bandwidth())
                            .attr("width", '1.5px')
                            .style("fill", "red");

                    } else {
                        gM2 = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                        gF2 = svg.append("g").attr( "transform", "translate(" + (margin.left + (w - centreSpacing) / 2 + centreSpacing) + "," + margin.top + ")");

                        //Hombres
                        gM2.selectAll("rect")
                            .data(auxSecond)
                            .enter()
                            .append("rect")
                            .attr('class', 'rect-second-men')
                            .attr("x", (d) => (w - centreSpacing) / 2 - x(+d.porc_hombres))
                            .attr("y", (d) => y(d.Edad))
                            .attr("height", y.bandwidth())
                            .attr("width", '1.5px')
                            .style("fill", "red");

                        //Mujeres
                        gF2.selectAll("rect")
                            .data(auxSecond)
                            .enter()
                            .append("rect")
                            .attr('class', 'rect-second-women')
                            .attr("x", (d) => x(+d.porc_mujeres))
                            .attr("y", (d) => y(d.Edad))
                            .attr("height", y.bandwidth())
                            .attr("width", '1.5px')
                            .style("fill", "red");

                        //Solo entra una primera vez aquí
                        isSecondSet = true;
                    }                    
                }
            }
        });
}