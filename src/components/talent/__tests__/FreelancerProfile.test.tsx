import { render, screen } from "@testing-library/react";
import FreelancerProfile from "../FreelancerProfile";
import { mockFreelancerProfiles } from "@/lib/mockData/freelancer-profile-mock";

// Mock all the complex components to avoid import issues
jest.mock("../ProfileHeader", () => {
  return function MockProfileHeader({ freelancer }: any) {
    return (
      <div data-testid="profile-header">
        <h1>{freelancer.name}</h1>
        <p>{freelancer.title}</p>
        <span>{freelancer.location}</span>
        <span>${freelancer.hourlyRate}/hr</span>
      </div>
    );
  };
});

jest.mock("../SkillsSection", () => {
  return function MockSkillsSection({ skills }: any) {
    return (
      <div data-testid="skills-section">
        <h2>Skills</h2>
        {skills.map((skill: any) => (
          <span key={skill.name}>{skill.name}</span>
        ))}
      </div>
    );
  };
});

jest.mock("../ExperienceSection", () => {
  return function MockExperienceSection({ experience }: any) {
    return (
      <div data-testid="experience-section">
        <h2>Work Experience</h2>
        {experience.map((exp: any) => (
          <div key={exp.position}>
            <span>{exp.position}</span>
            <span>{exp.company}</span>
          </div>
        ))}
      </div>
    );
  };
});

jest.mock("../ReviewsSection", () => {
  return function MockReviewsSection({ reviews }: any) {
    return (
      <div data-testid="reviews-section">
        <h2>Client Reviews</h2>
        {reviews.map((review: any) => (
          <span key={review.clientName}>{review.clientName}</span>
        ))}
      </div>
    );
  };
});

jest.mock("../ProfileNavigation", () => {
  return function MockProfileNavigation() {
    return (
      <div data-testid="profile-navigation">
        <span>Profile</span>
        <span>Portfolio</span>
      </div>
    );
  };
});

jest.mock("../PortfolioGallery", () => {
  return function MockPortfolioGallery() {
    return <div data-testid="portfolio-gallery">Portfolio Gallery</div>;
  };
});

jest.mock("../PortfolioItem", () => {
  return function MockPortfolioItem() {
    return <div data-testid="portfolio-item">Portfolio Item</div>;
  };
});

// Mock the window.location for testing
Object.defineProperty(window, "location", {
  value: {
    pathname: "/talent/1/profile",
  },
  writable: true,
});

describe("FreelancerProfile", () => {
  const mockFreelancer = mockFreelancerProfiles[0];

  it("renders freelancer profile with correct information", () => {
    render(<FreelancerProfile freelancer={mockFreelancer} />);

    // Check if the profile header is rendered
    expect(screen.getByTestId("profile-header")).toBeInTheDocument();

    // Check if the freelancer name is displayed
    expect(screen.getByText(mockFreelancer.name)).toBeInTheDocument();

    // Check if the title is displayed (use getAllByText since it appears in multiple places)
    expect(screen.getAllByText(mockFreelancer.title).length).toBeGreaterThan(0);

    // Check if the location is displayed
    expect(screen.getByText(mockFreelancer.location)).toBeInTheDocument();

    // Check if the hourly rate is displayed
    expect(
      screen.getByText(`$${mockFreelancer.hourlyRate}/hr`),
    ).toBeInTheDocument();
  });

  it("renders skills section", () => {
    render(<FreelancerProfile freelancer={mockFreelancer} />);

    expect(screen.getByTestId("skills-section")).toBeInTheDocument();
    expect(screen.getByText("Skills")).toBeInTheDocument();

    // Check if some skills are displayed
    mockFreelancer.skills.slice(0, 3).forEach((skill) => {
      expect(screen.getByText(skill.name)).toBeInTheDocument();
    });
  });

  it("renders experience section", () => {
    render(<FreelancerProfile freelancer={mockFreelancer} />);

    expect(screen.getByTestId("experience-section")).toBeInTheDocument();
    expect(screen.getByText("Work Experience")).toBeInTheDocument();

    // Check if experience items are displayed
    mockFreelancer.experience.forEach((exp) => {
      expect(screen.getAllByText(exp.position).length).toBeGreaterThan(0);
      expect(screen.getByText(exp.company)).toBeInTheDocument();
    });
  });

  it("renders reviews section", () => {
    render(<FreelancerProfile freelancer={mockFreelancer} />);

    expect(screen.getByTestId("reviews-section")).toBeInTheDocument();
    expect(screen.getByText("Client Reviews")).toBeInTheDocument();

    // Check if reviews are displayed
    mockFreelancer.reviews.forEach((review) => {
      expect(screen.getByText(review.clientName)).toBeInTheDocument();
    });
  });

  it("renders navigation tabs", () => {
    render(<FreelancerProfile freelancer={mockFreelancer} />);

    expect(screen.getByTestId("profile-navigation")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
  });
});
