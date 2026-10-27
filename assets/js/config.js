/*
 * ClinTrainers CT1 site settings — edit these values, no other code changes needed.
 */
window.CT_CONFIG = {
  // Where "Request a Demo" buttons send people. A static site can't process
  // forms on its own, so the demo CTA opens the visitor's email app.
  // To use a form service instead (Formspree, HubSpot, Netlify Forms), see README.md.
  demo: {
    email: 'inquiry@clintrainers.com',
    subject: 'CT1 demo request',
    body: 'Hello ClinTrainers team,\n\nWe would like to request a demo of the CT1 airway task trainer.\n\nName:\nOrganization:\nRole:\nProgram type (simulation center, school, EMS, other):\nApproximate number of learners:\nPreferred timing:\n\nThank you.'
  },

  // 3D hero. Paths are relative to index.html.
  // Leave "model" empty ('') to show the labeled placeholder instead.
  viewer: {
    model: 'assets/models/ct1.glb',            // desktop / tablet
    modelMobile: 'assets/models/ct1-mobile.glb', // phones (lighter file)
    rotateSpeed: 0.6,     // auto-rotation speed (1 = ~30 s per turn at 60 fps)
    exposure: 1.0,        // overall brightness
    environment: 1.0,     // reflection strength
    introLift: 0.06       // how far (meters) the cartridge drops in on first load; 0 to disable
  }
};
