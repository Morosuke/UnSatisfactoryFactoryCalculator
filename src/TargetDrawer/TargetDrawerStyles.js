const drawerWidth = 240;

const styles = theme => ({
    drawer: {
        flexShrink: 0,
        width: drawerWidth
    },
    drawerPaper: {
        width: drawerWidth
    },
    navOptions: {
        width: drawerWidth
    },
    toolbar: theme.mixins.toolbar
});

export default styles;
