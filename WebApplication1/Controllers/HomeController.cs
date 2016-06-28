using StartApp.DB;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WebApplication1.Controllers
{
    public class HomeController : Controller
    {
        // GET: Start
        public ActionResult Index()
        {
            using (EntityContext ec = new EntityContext())
            {
                ec.Database.Log += s => System.Diagnostics.Debug.WriteLine(s);

                var ret = ec.USUARIO.Join(ec.USUARIO, u => u.PER_ID, u2 => u2.PER_ID, (u1, u2) => new { per1 = u1.PER_ID, per2 = u2.PER_ID })
                    .GroupBy(c => c.per1, (k, g) => new { key = k, count = g.Count() })
                    .Select(c => c.count)
                    .OrderBy(o => o.key)
                    .Skip(10).Take(100);

                var a = ret.FirstOrDefault();
                return View(a);
            }
            return View();
        }
    }
}