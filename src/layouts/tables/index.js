/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/
import * as React from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import { Backdrop, Box, Modal, Fade, Button, Typography } from "@mui/material";
import MDBadge from "components/MDBadge";
import { IconButton, Icon } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "../../examples/Tables/DataTable";

// Data
import authorsTableData from "layouts/tables/data/authorsTableData";
// Images
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";
// import projectsTableData from "layouts/tables/data/projectsTableData";
// import TransitionsModal from "../../examples/Modal/BasicModal";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 6,
};
function Tables() {
  const { columns, Job, Author } = authorsTableData();

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  /* brining row and coloumn */

  const handleCallSupport = () => {
    handleOpen();
  };

  const rows = [
    {
      product: <Author image={team2} name="Recliner" email="johnEStore@gmail.com" />,
      category: <Job title="Furniture" description="shipped" />,
      status: (
        <MDBox ml={-1}>
          <MDBadge badgeContent="damaged" color="warning" variant="gradient" size="sm" />
        </MDBox>
      ),
      support: (
        <MDTypography component="a" variant="caption" color="text" fontWeight="medium">
          <IconButton size="small" aria-label="close" color="success" onClick={handleCallSupport}>
            <Icon fontSize="small">call</Icon>
          </IconButton>
        </MDTypography>
      ),
      employed: (
        <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
          23/04/24
        </MDTypography>
      ),
    },
    {
      product: <Author image={team3} name="Alexa Liras" email="alexa@gmail.com" />,
      category: <Job title="Clothing" description="shipped" />,
      status: (
        <MDBox ml={-1}>
          <MDBadge badgeContent="returned" color="dark" variant="gradient" size="sm" />
        </MDBox>
      ),
      support: (
        <MDTypography component="a" variant="caption" color="text" fontWeight="medium">
          <IconButton size="small" aria-label="close" color="success" onClick={handleCallSupport}>
            <Icon fontSize="small">call</Icon>
          </IconButton>
        </MDTypography>
      ),
      employed: (
        <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
          11/01/24
        </MDTypography>
      ),
    },
    {
      product: <Author image={team4} name="Laurent Perrier" email="laurent@gmail.com" />,
      category: <Job title="Furniture" description="shipped" />,
      status: (
        <MDBox ml={-1}>
          <MDBadge badgeContent="Delivered" color="success" variant="gradient" size="sm" />
        </MDBox>
      ),
      support: (
        <MDTypography component="a" variant="caption" color="text" fontWeight="medium">
          <IconButton size="small" aria-label="close" color="success" onClick={handleCallSupport}>
            <Icon fontSize="small">call</Icon>
          </IconButton>
        </MDTypography>
      ),
      employed: (
        <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
          19/09/17
        </MDTypography>
      ),
    },
    {
      product: <Author image={team3} name="Michael Levi" email="michael@gmail.com" />,
      category: <Job title="Food and beverage" description="shipped" />,
      status: (
        <MDBox ml={-1}>
          <MDBadge badgeContent="Delivered" color="success" variant="gradient" size="sm" />
        </MDBox>
      ),
      support: (
        <MDTypography component="a" variant="caption" color="text" fontWeight="medium">
          <IconButton size="small" aria-label="close" color="success" onClick={handleCallSupport}>
            <Icon fontSize="small">call</Icon>
          </IconButton>
        </MDTypography>
      ),
      employed: (
        <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
          24/12/23
        </MDTypography>
      ),
    },
    {
      product: <Author image={team3} name="Richard Gran" email="richard@gmail.com" />,
      category: <Job title="Books" description="shipped" />,
      status: (
        <MDBox ml={-1}>
          <MDBadge badgeContent="returned" color="dark" variant="gradient" size="sm" />
        </MDBox>
      ),
      support: (
        <MDTypography component="a" variant="caption" color="text" fontWeight="medium">
          <IconButton size="small" aria-label="close" color="success" onClick={handleCallSupport}>
            <Icon fontSize="small">call</Icon>
          </IconButton>
        </MDTypography>
      ),
      employed: (
        <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
          04/10/23
        </MDTypography>
      ),
    },
    {
      product: <Author image={team4} name="Miriam Eric" email="miriam@gmail.com" />,
      category: <Job title="Fashion" description="shipped" />,
      status: (
        <MDBox ml={-1}>
          <MDBadge badgeContent="returned" color="dark" variant="gradient" size="sm" />
        </MDBox>
      ),
      support: (
        <MDTypography component="a" variant="caption" color="text" fontWeight="medium">
          <IconButton size="small" aria-label="close" color="success" onClick={handleCallSupport}>
            <Icon fontSize="small">call</Icon>
          </IconButton>
        </MDTypography>
      ),
      employed: (
        <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
          14/09/23
        </MDTypography>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Products Table
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Projects Table
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                {/* <DataTable
                  table={{ columns: pColumns, rows: pRows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                /> */}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <>
        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          open={open}
          onClose={handleClose}
          closeAfterTransition
        >
          <Fade in={open}>
            <Box sx={style}>
              <Typography id="transition-modal-title" variant="h6" component="h2">
                Modal Header
              </Typography>
              <Typography id="transition-modal-description" sx={{ mt: 5 }}>
                <div className="container">
                  <label htmlFor="">Contact Name</label>
                  <input type="text" />
                  <label htmlFor="">Contact Email</label>
                  <input type="text" />
                </div>
              </Typography>
            </Box>
          </Fade>
        </Modal>
      </>
      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
