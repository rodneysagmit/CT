/*
 * ClinTrainers CT1 site settings. Edit these values; no other code changes needed.
 * Page text lives in index.html. Colors live at the top of assets/css/site.css.
 */
window.CT_CONFIG = {
  // "Request a Demo" and other inquiry buttons.
  inquiry: {
    email: 'inquiry@clintrainers.com',
    subject: 'CT1 demo request',
    // Pre-filled email body for the demo link (mode 'email').
    body: 'Hello ClinTrainers team,\n\nI would like to request a CT1 demo.\n\nName:\nOrganization:\nRole:\nProgram type (sim center, nursing, EMS, medical school, other):\nApproximate number of learners:\nPreferred timing:\n\nThank you.',
    // 'email' (default): buttons open the visitor's email app, addressed to the
    //   email above, with the subject and body filled in. No service needed.
    // 'form': buttons open the on-page inquiry form instead. A static host can't
    //   receive form posts, so also paste a form-service endpoint below
    //   (for example a Formspree URL like 'https://formspree.io/f/abcdwxyz').
    //   With 'form' and no endpoint, the form hands off to the email app.
    mode: 'email',
    endpoint: ''
  },

  // 3D hero. Paths are relative to index.html.
  // Leave "model" empty ('') to show the labeled placeholder instead.
  viewer: {
    model: 'assets/models/ct1.glb',              // desktop / tablet
    modelMobile: 'assets/models/ct1-mobile.glb', // phones (lighter file)
    rotateSpeed: 0.6,       // auto-rotation speed
    exposure: 1.0,          // overall brightness
    environment: 1.0,       // reflection strength
    rimColor: '#ffffff',    // back light (neutral white studio light; no colored edge glow)
    rim2Color: '#9a9fa3',   // second back light, dimmed by its gray color
    shadow: 0.55,           // floor shadow strength (0–1)
    introLift: 0.04,        // how high (meters) the cartridge starts above the base; 0 to disable
    cartridgeLoop: true,    // true: cartridge drops in, holds, lifts out, repeats. false: drops in once
    loopHold: 5             // seconds the cartridge stays seated each loop
  }
};
