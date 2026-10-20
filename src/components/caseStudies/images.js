import vstitchStorefront from '../../assets/case-studies/vstitch-storefront.jpg'
import divineVisionHomepage from '../../assets/case-studies/divine-vision-homepage.jpg'

// Keyed by case-study slug. Kept out of data/caseStudies.js so that file stays
// importable from Node scripts. width/height reserve space and prevent layout shift.
export const CASE_STUDY_IMAGES = {
  'vstitch-by-anjali-nanda': { src: vstitchStorefront, width: 1280, height: 800 },
  'divine-vision-infratech': { src: divineVisionHomepage, width: 1440, height: 900 },
}
