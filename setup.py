from setuptools import setup, find_packages

with open("requirements.txt") as f:
    install_requires = [
        line.strip() for line in f
        if line.strip() and not line.startswith("#")
    ]

setup(
    name="college_template",
    version="0.0.1",
    description="College ERP Customizations - Doctypes, Scripts, Reports & Dashboard",
    author="Bizaxl",
    author_email="info@bizaxl.com",
    packages=find_packages(),
    zip_safe=False,
    include_package_data=True,
    install_requires=install_requires,
)
