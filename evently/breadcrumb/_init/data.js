function(event, breadcrumbsInfo) {


    var breadcrumbsExist = (breadcrumbsInfo) ? true : false,
        isProjectsHome = (window.location.pathname.indexOf('projects.html') > -1) ? true : false,
        isDatabaseHome = (isProjectsHome) ? false : true,
        trail = (breadcrumbsInfo && breadcrumbsInfo.trail) ? breadcrumbsInfo.trail : breadcrumbsInfo;
    return {
        has_trail: breadcrumbsExist, 
        trail: trail,
        is_projects_home: isProjectsHome,
        is_database_home: isDatabaseHome
    };
}