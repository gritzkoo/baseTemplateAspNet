using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Optimization;

namespace WebApplication1.App_Start
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            // bundle responsavel pela inclusão de todos os css padrões
            bundles.Add(new StyleBundle("~/bundle/css").Include(
                "~/Content/bootstrap.css"
            ));
            // bundle responsavel pela inclusão de todos os js padrões
            bundles.Add(new ScriptBundle("~/bundle/js").Include(
                "~/scripts/jquery-1.9.1.js",
                "~/scripts/knockout-3.4.0.js",
                "~/scripts/knockout.validation.js",
                "~/scripts/ViewScripts/Shared/_defaultPage.js",
                "~/scripts/knockout-custom-bindings.js"
            ));
            // bundle responsavel pela inclusão de todos os js padrões no footer
            bundles.Add(new ScriptBundle("~/bundle/footerjs").Include(
                "~/scripts/bootstrap.js"
            ));

        }
    }
}