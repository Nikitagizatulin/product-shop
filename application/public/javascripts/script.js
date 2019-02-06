(function ($) {
    $(function () {
        $('input#delProduct').click(function (e) {
            if(!confirm('Are you sure that you want to delete this product?')){
            e.preventDefault();
            }
        });
        $('input#delUser').click(function (e) {
            if(!confirm('Are you sure that you want to delete this user?')){
                e.preventDefault();
            }
        });
    });
})(jQuery);