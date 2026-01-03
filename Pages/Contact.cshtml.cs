using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace supacoda_website.Pages;

public class ContactModel : PageModel
{
    public void OnGet()
    {
    }
    
    public IActionResult OnPost()
    {
        // Add your contact form handling logic here
        // For now, just redirect back to the contact page
        return RedirectToPage();
    }
}
