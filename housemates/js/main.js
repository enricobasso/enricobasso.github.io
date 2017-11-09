/**
 * Created by valentinodus on 14/02/2017.
 */
var tempLoadChoice;
var tempObj;

$(document).ready(function () {

    // Change Peoples Name
    var names = [
        'Marco',
        'Kevin',
        'Luca',
        'Vlady',
        'Vale',
        'Fede',
        'Koala',
    ];

    var people = [];
    $.each(names, function (index, item) { 
        var tmp_people_obj = {
            name: item,
            products: []
        };

        people.push(tmp_people_obj);
    });


    var products = [];
    var content_header = '';
    $.each(people, function (index, item) {
        content_header += '<th>' + item.name + '</th>';
    });

    $("#save").click(function(){
        saveTable();
    });

    $("#load").click(function(){
        loadFile("readlist","");
    });

    $("div#load-wrapper").click(function(e){
        if(e.target!==this){
            return;
        }
        $("#load-table tbody").html("");
        $("#load-wrapper").removeClass("visible");
        $('body').removeClass('noscroll');
    });

    $("#exit").click(function(){
        $("#load-table tbody").html("");
        $("#load-wrapper").removeClass("visible");
        $('body').removeClass('noscroll');
    });

    $("#load-table").on("click","td button",function(){
        tempLoadChoice = $(this).data('file-name');
        tempObj = $(this);
        $("#choose:before").css({
            content: $(this).text()
        });
        $("#choose").addClass("visible");        
    });

    $("#choose button").click(function(){
        if($(this).attr("id")=="btnLoad"){
            loadFile("loadF",tempLoadChoice);
        }else if($(this).attr("id")=="btnDelete"){
            loadFile("delete",tempLoadChoice);
        }
    });

    $('#table-header').append(content_header);

    var content_footer = '';
    $.each(people, function (index, person) {
        content_footer += '<th class="footer-prices" id="'+person.name+'" data-value="€">0</th>';
    });
    $('#table-footer').append(content_footer);

    $( "#insert-price" ).submit(function( event ) {
        event.preventDefault();

        var random_id = getProgressiveNumber();

        var prod = {
            id: random_id,
            name: $('#insert-price input#product-name').val(),
            price: parseFloat( $('#insert-price input#product-price').val().replace(',', '.') ),
            unprice: parseFloat( $('#insert-price input#product-price').val().replace(',', '.')/people.length ),
            peoplecount: people.length
        };

        products[random_id] = prod;

        $.each( people, function (index, item) {
            item.products.push(random_id);
        });

        // Clear inputs
        $(this).find("input").val("");

        add_tr( prod ,0);
    });

    function loadFile(type,name){

        if(type=="readlist"){
            $("#load-wrapper").addClass("visible");
            $('body').addClass('noscroll');

            $.ajax({
              url: "load.php",
              data: {type: type,filename: name},
              type: "post",
              dataType: "html"
            })
            .done(function( data ) {
                $('#load-table tbody').append(data);
            });
        }else if(type=="loadF"){
            $("#choose").removeClass("visible");
            $("#load-table tbody").html("");
            prog_number = -1;
            $.ajax({
                url: "load.php",
                data: {type: type,filename: name},
                type: "post",
                dataType: "JSON",
                success: function(json){
                    products = json.prodz;
                    people = json.peoplez;
                    afterLoad(name);
                }
            });
        }else if(type=="delete"){
            $("#choose").removeClass("visible");
            $.ajax({
                url: "load.php",
                data: {type: type,filename: name},
                type: "post",
                dataType: "text",
                success: function(data){
                    if(data=="y"){
                        tempObj.parent().parent().remove();
                    }else{
                        alert("Si è verificato un errore");
                    }
                }
            });
        }
    }

    function afterLoad(name){

        $("#main-table tbody").html("");
        $.ajax({
            url: "load.php",
            data: {type:"html",filename: name},
            type: "post",
            dataType: "text",
            success: function(data){
                $("#main-table tbody").html(data);
            }
        });
        
        $.each(products, function (index, obj){
            prog_number++;
            add_tr( obj , 1);
        });

        // Clear inputs
        $(this).find("input").val("");
        $("#load-wrapper").removeClass("visible");
        $('body').removeClass('noscroll');
        $("#main-table").find('input[type="checkbox"]').prop('checked', false);;
        
    }

    function saveTable(){

        var myJSON = JSON.stringify({
            prodz: products,
            peoplez: people
        });
        var nome = $("#saveName").val();

        $.ajax({
          url: "save.php",
          data: {
            products: myJSON,
            nome: nome,
            checkboxes: $("#main-table tbody").html()
          },
          type: "post",
          dataType: "text"
        })
        .done(function( data ) {
            if(data=="y"){
                $("#saveName").val("");
                $('#success-save').removeClass('hidden-xs-up');
                setTimeout(function () {
                    $('#success-save').addClass('hidden-xs-up');
                }, 1500);
            }else if(data=="n1"){
                alert("ERRORE: la tabella è vuota");
            }
        });
    }

    function add_tr( product, type ) {
        if(type==0){
            var tr_content = '';
            tr_content += '<tr id="'+product.id+'" class="prod-people-entity">';
            tr_content += ' <th scope="row">'+product.name+'</th>';
            tr_content += ' <th scope="row">'+product.price+'</th>';
            $.each( people, function (index, person) {
                tr_content += '<td><input type="checkbox" checked data-product-id="'+product.id+'" data-person="'+index+'"></td>'
            });
            tr_content += '</tr>';

            $('#table-body').append(tr_content);
        }
        recountEachPeople();
    }

    function recountEachPeople() {
        $.each( people, function (index, person) {
            var people_total_price = 0;

            $.each(person.products, function (i, prod) {
                people_total_price = people_total_price+products[prod].unprice;
            });

            $('#'+person.name).text( roundPrice( people_total_price ) );
        });

        reloadTotalPrice();
    }

    function removeProductFromPerson(product_id, person_id) {
        var index = people[person_id].products.indexOf(product_id);
        if (index > -1) {
            people[person_id].products.splice(index, 1);
        }

        decrementPeopleCount(product_id);
    }
    
    function decrementPeopleCount(product_id) {
        products[product_id].peoplecount--;

        calculateProductUnitaryPrice(product_id);
    }


    function addProductFromPerson(product_id, person_id) {
        people[person_id].products.push(product_id);

        incrementPeopleCount(product_id);
    }

    function incrementPeopleCount(product_id) {
        products[product_id].peoplecount++;

        calculateProductUnitaryPrice(product_id);
    }


    function calculateProductUnitaryPrice(product_id) {
        products[product_id].unprice = products[product_id].price/products[product_id].peoplecount;

    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    var prog_number = -1;
    function getProgressiveNumber() {
        prog_number++;
        return prog_number;
    }

    $(document).on('change', '#table-body input', function() {
        if( $(this).is(':checked') ) {
            $(this).attr( "checked" ,"checked" );
            addProductFromPerson($(this).data('product-id'), $(this).data('person') );
            recountEachPeople();
        }else{
            $(this).removeAttr( "checked" );
            removeProductFromPerson($(this).data('product-id'), $(this).data('person') );
            recountEachPeople();
        }

    });
    
    function reloadTotalPrice() {
        var total_price = 0;
        $.each( people, function (index, person) {
            total_price += parseFloat( $('#'+person.name).text() );
        });

        $('#total-price').text(total_price.toFixed(2));
    }

    function roundPrice(price) {
        return (Math.ceil(price*20 - 0.5)/20).toFixed(2);
    }

});



