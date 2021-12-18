    $(document).ready(async function () {

        $("#search-doc-bt").click(async function () {
            prefix = $("#search-doc-tb").val();
            render_doc_by_prefix(prefix);
        });


    })