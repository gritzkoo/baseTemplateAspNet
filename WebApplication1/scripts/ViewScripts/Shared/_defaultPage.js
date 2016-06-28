function GlobalViewModel()
{
    var self = this;

    self.submit = function(url, data, callback)
    {
        confirmModal.loading('show');
        $.post(url, data).done(function (response)
        {
            callback(JSON.parse(response));
        }).fail(function (er)
        {
            confirmModal.loading('hide');
            confirmModal.alertar(er);
        }).always(function ()
        {
            confirmModal.loading('hide');
        });
    }

    self.get = function (url, callback)
    {
        confirmModal.loading('show');
        $.get(url, callback, "json").fail(function ()
        {
            confirmModal.alertar('Ocorreu um erro na execução do serviço.');
        }).always(function ()
        {
            confirmModal.loading('hide');
        });
    };
}

var globalViewModel = new GlobalViewModel;